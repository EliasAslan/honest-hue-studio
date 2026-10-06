import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FitnessRecord } from "./fitness";
const access = z.string().regex(/^[a-f0-9]{64}$/);
async function hashKey(key: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
export const readFitness = createServerFn({ method: "POST" })
  .inputValidator((v) => z.object({ key: access }).parse(v))
  .handler(async ({ data }) => {
    const hash = await hashKey(data.key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows: FitnessRecord[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: page, error } = await supabaseAdmin
        .from("fitness_records")
        .select("id,kind,record_date,record_key,payload,created_at")
        .eq("owner_hash", hash)
        .order("record_date", { ascending: false })
        .order("id")
        .range(offset, offset + 999);
      if (error) throw new Error("Your history could not be loaded. Please try again.");
      rows.push(...(page as unknown as FitnessRecord[]));
      if (page.length < 1000) break;
    }
    return rows;
  });
const num = (max: number) => z.number().min(0).max(max).optional();
const payloads = {
  profile: z.object({
    age: num(120),
    height: num(250),
    startingWeight: num(500),
    goal: z.string().max(500).optional(),
    experience: z.string().max(100).optional(),
    equipment: z.string().max(300).optional(),
    duration: z.enum(["Short", "Standard", "Long"]).optional(),
    days: z.string().max(100).optional(),
    stepTarget: num(100000),
    startDate: z.string().optional(),
  }),
  daily: z.object({
    move: z.boolean().optional(),
    eat: z.boolean().optional(),
    recover: z.boolean().optional(),
    train: z.boolean().optional(),
    steps: num(100000),
    minutes: num(1440),
    sleep: num(24),
    fatigue: z.string().max(100).optional(),
    soreness: z.string().max(300).optional(),
    protein: z.boolean().optional(),
    water: z.boolean().optional(),
    produce: z.boolean().optional(),
    portions: z.boolean().optional(),
    snacks: z.boolean().optional(),
    alcohol: z.boolean().optional(),
  }),
  weight: z.object({ weight: z.number().positive().max(500) }),
  measurement: z.object({
    waist: num(300),
    chest: num(300),
    arm: num(150),
    thigh: num(200),
    height: num(250),
  }),
  workout: z.object({
    block: z.enum(["A", "B"]),
    duration: z.enum(["Short", "Standard", "Long"]),
    finished: z.boolean(),
    exercises: z
      .array(
        z.object({
          id: z.string().max(100),
          variation: z.string().max(100),
          notes: z.string().max(1000),
          sets: z
            .array(
              z.object({
                reps: z.number().min(0).max(500),
                resistance: z.number().min(0).max(1000),
                complete: z.boolean(),
              }),
            )
            .max(10),
        }),
      )
      .max(15),
  }),
};
export const saveFitness = createServerFn({ method: "POST" })
  .inputValidator((v) => {
    const base = z
      .object({
        key: access,
        kind: z.enum(["profile", "daily", "workout", "weight", "measurement"]),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        recordKey: z.string().min(1).max(100),
        payload: z.unknown(),
      })
      .parse(v);
    return { ...base, payload: payloads[base.kind].parse(base.payload) };
  })
  .handler(async ({ data }) => {
    const hash = await hashKey(data.key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("fitness_records")
      .upsert(
        {
          owner_hash: hash,
          kind: data.kind,
          record_date: data.date,
          record_key: data.recordKey,
          payload: data.payload,
        },
        { onConflict: "owner_hash,kind,record_key" },
      );
    if (error) throw new Error("Your entry could not be saved. Please try again.");
    return { saved: true };
  });
