import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isBefore, isSameDay, startOfWeek } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, Check, RotateCcw } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/fitness/provider";
import { PageTitle } from "@/components/fitness/shell";
import {
  exercises,
  durations,
  dayKey,
  workoutDayPlan,
  type Length,
  type WorkoutLog,
  type ExerciseLog,
} from "@/lib/fitness";
export const Route = createFileRoute("/workout")({
  validateSearch: z.object({ block: z.enum(["A", "B"]).optional() }),
  head: () => ({
    meta: [
      { title: "Workout — BEN. Sustain" },
      {
        name: "description",
        content:
          "Minimal-equipment Full Body A and B sessions for Benjamin, with flexible durations and progressive exercise logging.",
      },
      { property: "og:title", content: "Workout — BEN. Sustain" },
      {
        property: "og:description",
        content: "Train consistently with a simple full-body A/B plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workout,
});
function Workout() {
  const search = Route.useSearch();
  const { records, profile, today, save, saving, date } = useFitness();
  const currentDate = date ? new Date(date + "T12:00:00") : new Date();
  const [selectedDate, setSelectedDate] = useState(date || dayKey());
  const selected = new Date(selectedDate + "T12:00:00");
  const selectedPlan = workoutDayPlan(selected, profile.startDate);
  const [block, setBlock] = useState<"A" | "B">(search.block ?? selectedPlan.block ?? "A");
  const [length, setLength] = useState<Length>(profile.duration ?? "Standard");
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [sessionKey, setSessionKey] = useState("");
  const [finished, setFinished] = useState(false);
  const [rest, setRest] = useState(0);
  const weekStart = startOfWeek(selected, { weekStartsOn: 1 });
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart.getTime()]);
  useEffect(() => {
    if (!active && search.block) setBlock(search.block);
  }, [search.block, active]);
  useEffect(() => {
    if (!active && profile.duration) setLength(profile.duration);
  }, [profile.duration, active]);
  useEffect(() => {
    if (!active && date && !selectedDate) setSelectedDate(date);
  }, [date, selectedDate, active]);
  useEffect(() => {
    if (!rest) return;
    const id = setInterval(() => setRest((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [rest]);
  const history = records.filter((r) => r.kind === "workout" && (r.payload as WorkoutLog).finished);
  const recordsForDate = (value: string) =>
    records.filter((r) => r.kind === "workout" && r.record_date === value);
  const selectDay = (day: Date) => {
    if (active) return;
    const key = dayKey(day);
    const plan = workoutDayPlan(day, profile.startDate);
    setSelectedDate(key);
    if (plan.block) setBlock(plan.block);
  };
  const start = () => {
    setLogs(
      exercises[block].map((e) => ({
        id: e.id,
        variation: e.name,
        sets: Array.from({ length: length === "Short" ? 1 : 3 }, () => ({
          reps: 0,
          resistance: 0,
          complete: false,
        })),
        notes: "",
      })),
    );
    setSessionKey(crypto.randomUUID());
    setActive(true);
    setFinished(false);
  };
  const update = (i: number, fn: (log: ExerciseLog) => ExerciseLog) =>
    setLogs((v) => v.map((log, n) => (n === i ? fn(log) : log)));
  const persist = async (complete: boolean) => {
    if (complete && !logs.every((l) => l.sets.some((s) => s.complete && s.reps > 0))) {
      toast.error("Record at least one completed set for each movement before finishing.");
      return;
    }
    try {
      await save(
        "workout",
        { block, duration: length, exercises: logs, finished: complete },
        selectedDate,
        sessionKey,
      );
      if (!profile.startDate) await save("profile", { ...profile, startDate: selectedDate });
      if (complete) {
        if (selectedDate === date) await save("daily", { ...today, train: true });
        setFinished(true);
        setActive(false);
        toast.success("Workout complete. A small win that counts.");
      } else toast.success("Session saved. You can resume it from history.");
    } catch {
      toast.error("Could not save your session.");
    }
  };
  return (
    <>
      <PageTitle eyebrow="Your strength practice" title="Show up." accent="Get stronger.">
        <p>
          Full-body training, three times a week. Keep two good reps in reserve, and leave room to
          recover.
        </p>
      </PageTitle>
      <div className="container content-section">
        <section className="schedule" aria-label="Weekly workout schedule">
          <div className="schedule-head">
            <div className="min-w-0">
              <p className="eyebrow">Training schedule</p>
              <h2>{format(weekStart, "MMMM yyyy")}</h2>
            </div>
            <div className="schedule-actions">
              <Button variant="outline" size="icon" disabled={active} aria-label="Previous week" onClick={() => selectDay(addWeeks(selected, -1))}>
                <ArrowLeft />
              </Button>
              <Button variant="outline" size="icon" disabled={active} aria-label="Return to today" onClick={() => selectDay(currentDate)}>
                <CalendarDays />
              </Button>
              <Button variant="outline" size="icon" disabled={active} aria-label="Next week" onClick={() => selectDay(addWeeks(selected, 1))}>
                <ArrowRight />
              </Button>
            </div>
          </div>
          <div className="week-schedule">
            {week.map((day) => {
              const key = dayKey(day);
              const plan = workoutDayPlan(day, profile.startDate);
              const dayRecords = recordsForDate(key);
              const complete = dayRecords.some((r) => (r.payload as WorkoutLog).finished);
              const draft = dayRecords.some((r) => !(r.payload as WorkoutLog).finished);
              const past = isBefore(day, currentDate) && !isSameDay(day, currentDate);
              const status = complete ? "Done" : draft ? "Saved" : plan.kind === "recovery" ? "Rest" : past && plan.kind === "main" ? "Missed" : plan.kind === "optional" ? "Optional" : `Body ${plan.block}`;
              return (
                <Button
                  key={key}
                  variant="ghost"
                  className={`schedule-day ${key === selectedDate ? "selected" : ""} ${isSameDay(day, currentDate) ? "today" : ""} ${complete ? "complete" : ""}`}
                  disabled={active}
                  onClick={() => selectDay(day)}
                  aria-label={`${format(day, "EEEE d MMMM")}, ${status}`}
                  aria-pressed={key === selectedDate}
                >
                  <span>{format(day, "EEEEE")}</span>
                  <strong>{format(day, "d")}</strong>
                  <small>{complete ? <Check aria-hidden="true" /> : status}</small>
                </Button>
              );
            })}
          </div>
        </section>

        <section className="day-guide">
          <div className="day-guide-title">
            <p className="eyebrow">{selectedDate === date ? "Today" : format(selected, "EEEE · d MMMM")}</p>
            <h2>{selectedPlan.kind === "recovery" ? "Recovery day" : `${selectedPlan.kind === "optional" ? "Optional · " : ""}Full Body ${block}`}</h2>
            <p>{selectedPlan.kind === "recovery" ? "No strength session is planned. An easy walk and good recovery keep the week moving." : selectedPlan.kind === "optional" ? "Only train if you feel recovered. Skipping this session is part of the plan, not falling behind." : "Your planned full-body session. Keep two good reps in reserve and finish feeling capable."}</p>
          </div>
          {selectedPlan.kind !== "recovery" ? (
            <div className="day-guide-controls">
              <div className="segment" aria-label="Workout duration">
                {(["Short", "Standard", "Long"] as const).map((l) => (
                  <Button variant={length === l ? "selected" : "nav"} key={l} disabled={active} onClick={() => setLength(l)}>
                    {l}<small>{durations[l]}</small>
                  </Button>
                ))}
              </div>
              {!active && <Button variant="athletic" onClick={start}>{finished ? "Start another" : "Start workout"}<ArrowRight /></Button>}
            </div>
          ) : (
            <Button variant="outline" disabled={active} onClick={() => { setBlock(workoutDayPlan(addDays(selected, 1), profile.startDate).block ?? block); }}>
              <RotateCcw /> Keep recovery first
            </Button>
          )}
        </section>
        <div className="workout-layout">
          <div>
            <div className="section-top">
              <h2>Full Body {block}</h2>
              {active ? (
                <span>{rest ? `Rest · ${rest}s` : "Session in progress"}</span>
              ) : <span>{selectedPlan.kind === "recovery" ? "Preview" : durations[length]}</span>}
            </div>
            <div className="exercise-row">
              <p className="eyebrow">
                Before you start · {length === "Short" ? "2–3" : "5"} minutes
              </p>
              <p className="exercise-cue">
                Easy marching, arm circles, a few supported squats and gentle hip hinges. Start
                slowly and use a pain-free range.
              </p>
            </div>
            {exercises[block].map((e, i) => {
              const log = logs[i];
              const previous = history
                .map((r) => ({
                  date: r.record_date,
                  log: (r.payload as WorkoutLog).exercises.find(
                    (l) => l.id === e.id && (!active || l.variation === log?.variation),
                  ),
                }))
                .find((r) => r.log);
              return (
                <section className="exercise-row" key={e.id}>
                  <div className="exercise-heading">
                    <span className="exercise-num">0{i + 1}</span>
                    <div className="exercise-main">
                      <p className="eyebrow">{e.category}</p>
                      <h3>{e.name}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {length === "Short" ? "1–2" : "3"} × {e.range}
                    </span>
                  </div>
                  <p className="exercise-cue">{e.cue}</p>
                  <details>
                    <summary>Technique, alternatives & progression</summary>
                    <p>
                      <strong>Why:</strong> {e.why}
                    </p>
                    <p>
                      <strong>Easier:</strong> {e.easier}
                    </p>
                    <p>
                      <strong>Harder:</strong> {e.harder}
                    </p>
                    <p>
                      <strong>Equipment:</strong> {e.equipment}
                    </p>
                    <p>
                      Reach the top of your range in every set with controlled technique twice
                      before making the movement harder. Return to the low end after progressing.
                    </p>
                  </details>
                  <p className="previous">
                    {previous?.log
                      ? `Last time · ${previous.date}: ${previous.log.variation} · ${previous.log.sets
                          .filter((s) => s.complete)
                          .map((s) => `${s.reps}${s.resistance ? ` @ ${s.resistance} kg` : ""}`)
                          .join(" / ")}`
                      : "No previous performance for this variation yet."}
                  </p>
                  {active && log && (
                    <>
                      <label className="field mt-4">
                        Variation
                        <select
                          value={log.variation}
                          onChange={(ev) =>
                            update(i, (l) => ({ ...l, variation: ev.target.value }))
                          }
                        >
                          {e.variations.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <table className="sets-table">
                        <thead>
                          <tr>
                            <th>Set</th>
                            <th>{e.id === "core-b" ? "Seconds" : "Reps"}</th>
                            <th>Added kg</th>
                            <th>Done</th>
                          </tr>
                        </thead>
                        <tbody>
                          {log.sets.map((s, j) => (
                            <tr key={j}>
                              <td data-label="Set">{j + 1}</td>
                              <td data-label={e.id === "core-b" ? "Seconds" : "Reps"}>
                                <input
                                  aria-label={`${e.name} set ${j + 1} reps`}
                                  type="number"
                                  min="0"
                                  max="500"
                                  value={s.reps || ""}
                                  onChange={(ev) =>
                                    update(i, (l) => ({
                                      ...l,
                                      sets: l.sets.map((set, n) =>
                                        n === j ? { ...set, reps: Number(ev.target.value) } : set,
                                      ),
                                    }))
                                  }
                                />
                              </td>
                              <td data-label="Added kg">
                                <input
                                  aria-label={`${e.name} set ${j + 1} resistance`}
                                  type="number"
                                  min="0"
                                  max="1000"
                                  step=".5"
                                  value={s.resistance || ""}
                                  placeholder="0"
                                  onChange={(ev) =>
                                    update(i, (l) => ({
                                      ...l,
                                      sets: l.sets.map((set, n) =>
                                        n === j
                                          ? { ...set, resistance: Number(ev.target.value) }
                                          : set,
                                      ),
                                    }))
                                  }
                                />
                              </td>
                              <td data-label="Done">
                                <input
                                  type="checkbox"
                                  aria-label={`${e.name} set ${j + 1} complete`}
                                  checked={s.complete}
                                  onChange={(ev) => {
                                    update(i, (l) => ({
                                      ...l,
                                      sets: l.sets.map((set, n) =>
                                        n === j ? { ...set, complete: ev.target.checked } : set,
                                      ),
                                    }));
                                    if (ev.target.checked) setRest(75);
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Button
                        variant="link"
                        size="sm"
                        disabled={log.sets.length >= 6}
                        onClick={() =>
                          update(i, (l) => ({
                            ...l,
                            sets: [...l.sets, { reps: 0, resistance: 0, complete: false }],
                          }))
                        }
                      >
                        + Add set
                      </Button>
                      <label className="field mt-3">
                        Notes
                        <textarea
                          maxLength={1000}
                          placeholder="Technique, effort, or anything to remember"
                          value={log.notes}
                          onChange={(ev) => update(i, (l) => ({ ...l, notes: ev.target.value }))}
                        />
                      </label>
                    </>
                  )}
                </section>
              );
            })}
            {length === "Long" && (
              <div className="exercise-row">
                <p className="eyebrow">Optional extra · 10–15 minutes</p>
                <p className="exercise-cue">
                  Add two easy sets of calf raises, a comfortable walk, and gentle hip and shoulder
                  mobility. Extras are optional, not a reason to push through fatigue.
                </p>
              </div>
            )}
            <div className="exercise-row">
              <p className="eyebrow">Cool-down · {length === "Short" ? "1–2" : "3–5"} minutes</p>
              <p className="exercise-cue">
                Walk slowly, breathe normally and gently stretch if comfortable. Stop for sharp or
                unusual pain.
              </p>
            </div>
            {active && (
              <div className="form-actions">
                <Button variant="athletic" disabled={saving} onClick={() => persist(true)}>
                  {saving ? "Saving…" : "Finish workout"}
                </Button>
                <Button variant="outline" disabled={saving} onClick={() => persist(false)}>
                  Save for later
                </Button>
              </div>
            )}
          </div>
          <aside className="workout-aside">
            <p className="eyebrow">How to approach today</p>
            <h3>Consistency, not intensity.</h3>
            <p className="mt-3">A short workout counts. Start with one controlled set of each movement; add a second if time allows.</p>
            <div className="rhythm-list">
              <span><strong>01</strong> Move with control</span>
              <span><strong>02</strong> Keep two reps in reserve</span>
              <span><strong>03</strong> Rest 60–90 seconds</span>
            </div>
            {profile.days && <p className="mt-3">Your preferred days: {profile.days}</p>}
            <Button variant="outline" className="mt-4" onClick={() => setRest(rest ? 0 : 75)}>{rest ? `Skip rest · ${rest}s` : "Start 75s rest"}</Button>
          </aside>
        </div>
        <section className="content-section">
          <div className="section-top">
            <h2>Your sessions</h2>
            <span>{history.length} completed</span>
          </div>
          {records.filter((r) => r.kind === "workout").length ? (
            records
              .filter((r) => r.kind === "workout")
              .map((r) => {
                const w = r.payload as WorkoutLog;
                return (
                  <div className="history-row" key={r.id}>
                    <details>
                      <summary className="cursor-pointer">
                        Full Body {w.block} · {r.record_date} · {w.duration}{" "}
                        {!w.finished ? "· In progress" : ""}
                      </summary>
                      <div className="mt-3 text-muted-foreground">
                        {w.exercises.map((e) => (
                          <p className="py-1" key={e.id}>
                            {e.variation}:{" "}
                            {e.sets
                              .filter((s) => s.complete)
                              .map((s) => `${s.reps}${s.resistance ? ` @ ${s.resistance} kg` : ""}`)
                              .join(" / ") || "No completed sets"}{" "}
                            {e.notes ? `— ${e.notes}` : ""}
                          </p>
                        ))}
                      </div>
                    </details>
                    {!w.finished && !active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBlock(w.block);
                          setLength(w.duration);
                          setLogs(w.exercises);
                          setSessionKey(r.record_key);
                          setActive(true);
                          setFinished(false);
                        }}
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="empty-state">
              <strong>Your first session starts here.</strong>
              <span>Completed workouts and exercise performance will stay in your journal.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
