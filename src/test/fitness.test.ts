import { describe, it, expect } from "vitest";
import { plannedBlock, weightStats, exercises, type FitnessRecord } from "@/lib/fitness";
describe("Benjamin’s training plan", () => {
  it("balances A/B across weeks", () => {
    expect(plannedBlock(new Date("2026-10-05T12:00:00"), "2026-10-05")).toBe("A");
    expect(plannedBlock(new Date("2026-10-07T12:00:00"), "2026-10-05")).toBe("B");
    expect(plannedBlock(new Date("2026-10-12T12:00:00"), "2026-10-05")).toBe("B");
  });
  it("includes all core movement categories in both blocks", () => {
    for (const block of ["A", "B"] as const)
      expect(exercises[block].map((e) => e.category)).toEqual([
        "Lower body",
        "Push",
        "Pull",
        "Posterior chain",
        "Core",
      ]);
  });
  it("does not invent empty weight progress", () => {
    expect(weightStats([]).current).toBeUndefined();
    expect(weightStats([]).trend).toBeUndefined();
  });
  it("averages available readings in the latest 7-day window", () => {
    const rows = [
      ["2026-10-01", 90],
      ["2026-10-07", 89],
      ["2026-10-08", 88],
    ].map(([d, w]) => ({
      kind: "weight",
      record_date: d,
      payload: { weight: w },
    })) as FitnessRecord[];
    expect(weightStats(rows).trend).toBe(88.5);
    expect(weightStats(rows).change).toBe(-2);
  });
});
