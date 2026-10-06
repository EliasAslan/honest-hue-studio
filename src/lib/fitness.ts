import { format, startOfWeek, differenceInCalendarWeeks } from "date-fns";
export type Habit = "move" | "eat" | "recover" | "train";
export type Length = "Short" | "Standard" | "Long";
export interface Profile {
  age?: number;
  height?: number;
  startingWeight?: number;
  goal?: string;
  experience?: string;
  equipment?: string;
  duration?: Length;
  days?: string;
  stepTarget?: number;
  startDate?: string;
}
export interface Daily {
  move?: boolean;
  eat?: boolean;
  recover?: boolean;
  train?: boolean;
  steps?: number;
  minutes?: number;
  sleep?: number;
  fatigue?: string;
  soreness?: string;
  protein?: boolean;
  water?: boolean;
  produce?: boolean;
  portions?: boolean;
  snacks?: boolean;
  alcohol?: boolean;
}
export interface SetLog {
  reps: number;
  resistance: number;
  complete: boolean;
}
export interface ExerciseLog {
  id: string;
  variation: string;
  sets: SetLog[];
  notes: string;
}
export interface WorkoutLog {
  block: "A" | "B";
  duration: Length;
  exercises: ExerciseLog[];
  finished: boolean;
}
export interface Measurement {
  waist?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  height?: number;
}
export interface FitnessRecord {
  id: string;
  kind: "profile" | "daily" | "workout" | "weight" | "measurement";
  record_date: string;
  record_key: string;
  payload: Profile | Daily | WorkoutLog | Measurement | { weight: number };
  created_at: string;
}
export const dayKey = (d = new Date()) => format(d, "yyyy-MM-dd");
export const weekKey = (d = new Date()) => dayKey(startOfWeek(d, { weekStartsOn: 1 }));
export const durations: Record<Length, string> = {
  Short: "20 min",
  Standard: "35–45 min",
  Long: "55–60 min",
};
export function plannedBlock(date: Date, startDate?: string): "A" | "B" {
  const n = startDate
    ? Math.abs(
        differenceInCalendarWeeks(date, new Date(startDate + "T12:00:00"), { weekStartsOn: 1 }),
      )
    : 0;
  const b = date.getDay() === 3 || date.getDay() === 6;
  return b !== (n % 2 === 1) ? "B" : "A";
}
export interface Exercise {
  id: string;
  name: string;
  category: string;
  range: string;
  cue: string;
  why: string;
  easier: string;
  harder: string;
  equipment: string;
  variations: string[];
}
export const exercises: Record<"A" | "B", Exercise[]> = {
  A: [
    {
      id: "squat",
      name: "Bodyweight squat",
      category: "Lower body",
      range: "6–12",
      cue: "Feet around shoulder width. Sit down between your hips, keep heels planted, then stand tall.",
      why: "Builds leg strength for everyday movement.",
      easier: "Sit to a stable chair and stand, using support if needed.",
      harder: "Slow the lowering phase or use a split squat.",
      equipment: "None. Stable chair optional.",
      variations: ["Bodyweight squat", "Chair squat", "Slow squat", "Split squat"],
    },
    {
      id: "push",
      name: "Push-up",
      category: "Push",
      range: "6–12",
      cue: "Keep ribs and hips aligned. Lower your chest with elbows roughly 30–45° from your body. Use an incline if needed.",
      why: "Trains chest, shoulders and arms while bracing your trunk.",
      easier: "Place hands on a stable wall or counter.",
      harder: "Lower the incline, then use a slower floor push-up.",
      equipment: "None. Stable counter optional.",
      variations: ["Push-up", "Wall push-up", "Counter push-up", "Slow push-up"],
    },
    {
      id: "pull",
      name: "Self-resisted row",
      category: "Pull",
      range: "8–12 / side",
      cue: "Hold one wrist with the opposite hand. Pull the working elbow back while the other hand gives gentle resistance. Keep shoulders down.",
      why: "Practises pulling without relying on unsafe doors or furniture. A band or properly installed bar offers fuller progression later.",
      easier: "Reduce resistance from the other hand.",
      harder: "Increase gentle resistance or use a band row.",
      equipment: "None. Band row or assisted pull-up optional with secure equipment.",
      variations: ["Self-resisted row", "Band row", "Assisted pull-up"],
    },
    {
      id: "bridge",
      name: "Glute bridge",
      category: "Posterior chain",
      range: "8–15",
      cue: "Lie on your back, knees bent. Press through heels and raise hips without arching your lower back.",
      why: "Strengthens your glutes and complements squat work.",
      easier: "Use a smaller pain-free range.",
      harder: "Pause at the top, then try one leg.",
      equipment: "None.",
      variations: ["Glute bridge", "Paused bridge", "Single-leg bridge"],
    },
    {
      id: "core-a",
      name: "Dead bug",
      category: "Core",
      range: "6–10 / side",
      cue: "On your back, gently brace. Extend opposite arm and leg only as far as your back stays comfortably still.",
      why: "Builds trunk control without high-impact movements.",
      easier: "Move just a heel at a time.",
      harder: "Extend further with a slow pause.",
      equipment: "None.",
      variations: ["Dead bug", "Heel tap", "Slow dead bug"],
    },
  ],
  B: [
    {
      id: "lunge",
      name: "Supported split squat",
      category: "Lower body",
      range: "6–12 / side",
      cue: "Use a staggered stance and light support. Bend both knees, lower straight down, and push through the front foot.",
      why: "Builds single-leg strength and balance.",
      easier: "Hold a wall and shorten the range.",
      harder: "Remove support or add a slow lowering phase.",
      equipment: "None. Wall for balance optional.",
      variations: ["Supported split squat", "Split squat", "Slow split squat"],
    },
    {
      id: "push",
      name: "Push-up",
      category: "Push",
      range: "6–12",
      cue: "Choose an incline where every rep is controlled. Keep your whole body aligned and avoid shrugging.",
      why: "Repeating the same push pattern lets you build skill and compare performance.",
      easier: "Use a wall or higher stable surface.",
      harder: "Lower the incline or slow your reps.",
      equipment: "None. Stable counter optional.",
      variations: ["Push-up", "Wall push-up", "Counter push-up", "Slow push-up"],
    },
    {
      id: "pull",
      name: "Self-resisted row",
      category: "Pull",
      range: "8–12 / side",
      cue: "Resist one wrist with the other hand as the working elbow pulls back. Stay tall and avoid twisting.",
      why: "Keeps pulling work in the plan without assuming equipment.",
      easier: "Use light resistance.",
      harder: "Use a band row or a securely installed pull-up bar.",
      equipment: "None. Band or secure bar optional.",
      variations: ["Self-resisted row", "Band row", "Assisted pull-up"],
    },
    {
      id: "hinge",
      name: "Bodyweight hip hinge",
      category: "Posterior chain",
      range: "8–15",
      cue: "Soften knees and send hips backwards. Keep your spine comfortably neutral, then stand by driving hips forwards.",
      why: "Teaches the hinge pattern and trains the hips.",
      easier: "Touch hips to a wall behind you.",
      harder: "Try a supported single-leg hinge.",
      equipment: "None.",
      variations: ["Bodyweight hip hinge", "Wall hip hinge", "Supported single-leg hinge"],
    },
    {
      id: "core-b",
      name: "Side plank",
      category: "Core",
      range: "15–30 seconds / side",
      cue: "Elbow below shoulder. Lift hips and hold with a steady breath. Start with knees bent.",
      why: "Builds side-to-side trunk stability.",
      easier: "Bend knees and shorten the hold.",
      harder: "Straighten legs or add a few seconds.",
      equipment: "None.",
      variations: ["Side plank", "Knee side plank", "Long-lever side plank"],
    },
  ],
};
export const faqs = [
  [
    "Fat loss",
    "How does fat loss work?",
    "A modest, consistent energy deficit lets your body use stored energy. Start with filling meals, protein, produce, reasonable portions and regular activity—not extreme restriction.",
  ],
  [
    "Fat loss",
    "Can I target belly fat?",
    "No exercise selectively removes belly fat. Overall fat loss can reduce waist size over time; where it happens first varies between people.",
  ],
  [
    "Progress",
    "Why does weight fluctuate?",
    "Water, salt, digestion and stored carbohydrate can change scale weight without changing body fat. Compare trends across weeks, not one weigh-in.",
  ],
  [
    "Progress",
    "How often should I weigh myself?",
    "Choose a frequency you find comfortable: daily or a few times a week both work. Use similar conditions, ideally after waking and using the bathroom. Daily weighing is optional.",
  ],
  [
    "Progress",
    "How do I measure my waist?",
    "Stand relaxed. Place a tape horizontally midway between your lowest rib and the top of your hip bone. Measure after a normal breath out, without pulling the tape tight. Use the same method each time.",
  ],
  [
    "Training",
    "Why strength train during weight loss?",
    "Strength training helps maintain muscle and strength while losing body fat. You do not need to exhaust yourself; repeatable quality sessions matter most.",
  ],
  [
    "Nutrition",
    "Why does protein matter?",
    "Protein supports muscle repair and helps meals feel satisfying. Include a protein source with main meals; supplements are not required.",
  ],
  [
    "Activity",
    "How many steps are useful?",
    "Record your normal week first. If recovery is good, gradually add comfortable walking—such as a short walk during a driving break. There is no universal 10,000-step requirement.",
  ],
  [
    "Training",
    "What if I miss a workout?",
    "Resume with the next A/B session. Do not double the volume to catch up. A short session is a successful workout too.",
  ],
  [
    "Training",
    "What if an exercise is too difficult?",
    "Choose the easier variation, reduce range or do fewer controlled repetitions. Keep around two reps in reserve rather than forcing poor technique.",
  ],
  [
    "Training",
    "What if an exercise is too easy?",
    "When all sets reach the top of the range with controlled technique in two sessions, choose a slightly harder variation and return to the lower end. Change one thing at a time.",
  ],
  [
    "Recovery",
    "How much recovery do I need?",
    "Leave a rest day between main strength sessions where possible. Gentle walking is fine on rest days. Persistent fatigue or falling performance are reasons to reduce volume.",
  ],
  [
    "Recovery",
    "Why does sleep matter?",
    "Sleep supports recovery, mood and appetite regulation. Most adults benefit from roughly 7–9 hours, though individual needs differ.",
  ],
  [
    "Nutrition",
    "Are supplements necessary?",
    "No. Consistent training, food habits and sleep are the foundation. Discuss suspected deficiencies or health concerns with a qualified professional.",
  ],
  [
    "Training",
    "How do I progress safely?",
    "Keep reps controlled and stop before form breaks. Progress repetitions first, then difficulty. Stop a movement for sharp or unusual pain; seek professional advice for persistent or concerning symptoms.",
  ],
];
export function weightStats(records: FitnessRecord[]) {
  const points = records
    .filter((r) => r.kind === "weight")
    .sort((a, b) => a.record_date.localeCompare(b.record_date))
    .map((r) => ({ date: r.record_date, value: (r.payload as { weight: number }).weight }));
  const latest = points.at(-1);
  const recent = latest
    ? points.filter(
        (p) =>
          p.date >= dayKey(new Date(new Date(latest.date + "T12:00:00").getTime() - 6 * 86400000)),
      )
    : [];
  const trend = recent.length ? recent.reduce((s, p) => s + p.value, 0) / recent.length : undefined;
  return {
    points,
    current: latest?.value,
    trend,
    change: points.length > 1 ? (latest?.value ?? 0) - (points[0]?.value ?? 0) : undefined,
  };
}
