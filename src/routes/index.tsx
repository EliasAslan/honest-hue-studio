import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/fitness/provider";
import { HabitDialog } from "@/components/fitness/forms";
import {
  durations,
  plannedBlock,
  weekKey,
  weightStats,
  type Habit,
  type WorkoutLog,
  type Daily,
} from "@/lib/fitness";
import trainingImage from "@/assets/home-training.jpg";
import { toast } from "sonner";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — BEN. Sustain" },
      {
        name: "description",
        content:
          "Benjamin’s daily training plan, activity, food habits and recovery. Sustainable progress, one day at a time.",
      },
      { property: "og:title", content: "Today — BEN. Sustain" },
      {
        property: "og:description",
        content: "Benjamin’s personal fitness journal and daily plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  const { records, today, profile, date, save, saving, loading } = useFitness();
  const [habit, setHabit] = useState<Habit | null>(null);
  const now = date ? new Date(date + "T12:00:00") : null;
  const block = now ? plannedBlock(now, profile.startDate) : "A";
  const isTraining = now ? [1, 3, 5].includes(now.getDay()) : true;
  const done = [today.move, today.eat, today.recover, today.train].filter(Boolean).length;
  const workouts = records.filter(
    (r) =>
      r.kind === "workout" &&
      r.record_date >= (now ? weekKey(now) : "") &&
      (r.payload as WorkoutLog).finished,
  );
  const weights = weightStats(records);
  const toggle = async (h: Habit) => {
    try {
      await save("daily", { ...today, [h]: !today[h] });
    } catch {
      toast.error("Could not save this check.");
    }
  };
  const habitItems: [Habit, string, string][] = [
    [
      "move",
      "Move",
      today.steps !== undefined
        ? `${today.steps.toLocaleString()} steps${profile.stepTarget ? ` / ${profile.stepTarget.toLocaleString()} target` : ""}`
        : "A walk, a driving break, a little more movement.",
    ],
    ["eat", "Eat", "Protein, produce, water. Keep it simple."],
    [
      "recover",
      "Recover",
      today.sleep !== undefined
        ? `${today.sleep} hours of sleep · ${today.fatigue ?? "Fatigue not recorded"}`
        : "Good sleep and a little room to recharge.",
    ],
    [
      "train",
      "Train",
      isTraining
        ? `Your Full Body ${block} session. Any length counts.`
        : "Rest day. Walking is welcome; recovery comes first.",
    ],
  ];
  return (
    <>
      <section className="home-hero">
        <div className="container hero-inner">
          <p className="eyebrow">
            {now ? format(now, "EEEE · d MMMM yyyy") : "Your daily plan"}{" "}
            <span className="text-primary"> / </span> Benjamin’s journal
          </p>
          <h1>
            Today is
            <br />
            <span className="text-primary">built to move.</span>
          </h1>
          <p className="hero-copy">
            {isTraining
              ? "Four small wins. One full-body session."
              : "A little movement. A little recovery."}
            <br />
            {isTraining
              ? "Welcome back, Benjamin. Let’s keep it consistent."
              : "Rest is part of the plan, Benjamin."}
          </p>
          <Button asChild variant="athletic" className="hero-action">
            <Link to="/workout" search={{ block }}>
              Full Body {block} · {durations[profile.duration ?? "Standard"]}
              <span className="ml-3">{isTraining ? "Start" : "Open"}</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <img src={trainingImage} width={1200} height={800} alt="" />
        </div>
      </section>
      <section className="container content-section">
        <div className="section-top">
          <h2>Today’s checklist</h2>
          <span>{done} / 4 done</span>
        </div>
        <div className="check-grid">
          {habitItems.map(([id, title, copy]) => (
            <div key={id} className={`habit-card ${today[id] ? "done" : ""}`}>
              <Button
                variant="check"
                className="habit-check"
                size="icon"
                role="checkbox"
                aria-checked={!!today[id]}
                aria-label={`Complete ${title.toLowerCase()}`}
                disabled={saving || loading}
                onClick={() => toggle(id)}
              >
                {today[id] ? <Check /> : null}
              </Button>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              {id === "train" ? (
                <Button asChild variant="ghost" size="icon" className="habit-log">
                  <Link to="/workout" search={{ block }} aria-label="Open workout">
                    <ArrowUpRight />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="habit-log"
                  aria-label={`Log ${title.toLowerCase()}`}
                  onClick={() => setHabit(id)}
                >
                  <Plus />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="training-band">
        <div className="container">
          <h2>Full-body blocks</h2>
          <p>Three sessions a week, plus an optional fourth. Same plan, your pace.</p>
          <div className="block-grid">
            {(
              [
                ["A", "Block 01", "Squat · Push · Pull · Core"],
                ["B", "Block 02", "Split squat · Push · Hinge · Core"],
                ["B", "Optional", "Repeat A or B · Only if you feel recovered"],
              ] as const
            ).map(([b, label, copy], i) => (
              <div className="block-card" key={label}>
                <p className="eyebrow">{label}</p>
                <div className="block-title">
                  <h3>{i === 2 ? "+1" : b}</h3>
                  <Button variant="nav" size="icon" asChild>
                    <Link to="/workout" search={{ block: b }} aria-label={`Open ${label} workout`}>
                      <ArrowUpRight className="text-band-foreground" />
                    </Link>
                  </Button>
                </div>
                <p>{copy}</p>
                <p className="times">SHORT 20 · STANDARD 35–45 · LONG 55–60 MIN</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container summary-grid">
        <div className="summary-item">
          <p className="eyebrow">This week</p>
          <p>
            {workouts.length
              ? `${workouts.length} of 3 main sessions completed. Keep making room for recovery.`
              : "No sessions logged yet. Your first completed workout starts the count."}
          </p>
          <div className="week-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span className={`week-day ${[0, 2, 4].includes(i) ? "active" : ""}`} key={i}>
                {d}
              </span>
            ))}
          </div>
        </div>
        <div className="summary-item">
          <p className="eyebrow">Daily tip</p>
          <p>
            Anchor protein to a meal you already eat. A small, repeatable habit beats a perfect plan
            you can’t sustain.
          </p>
          <Button asChild variant="link" size="sm" className="mt-3 p-0">
            <Link to="/guide">
              A little more know-how <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="summary-item">
          <p className="eyebrow">The bigger picture</p>
          <p>
            {weights.current !== undefined
              ? `Latest weight: ${weights.current.toFixed(1)} kg. ${weights.points.length > 1 ? "Look at the trend, not a single number." : "A few more readings will reveal a trend."}`
              : "Your weight and waist trends begin with a first entry. No pressure to measure every day."}
          </p>
          <Button asChild variant="link" size="sm" className="mt-3 p-0">
            <Link to="/progress">
              View your progress <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      {habit && <HabitDialog key={habit} habit={habit} onClose={() => setHabit(null)} />}
    </>
  );
}
