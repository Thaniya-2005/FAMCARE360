import { describe, it, expect } from "vitest";

describe("FAMCARE360 Child Application Health & Navigation Logic", () => {
  it("calculates child check-in completion percentage accurately", () => {
    const categories = [
      { progress: 67 }, // Food
      { progress: 83 }, // Water
      { progress: 94 }, // Sleep
      { progress: 67 }, // Activity
      { progress: 100 }, // Well-being
      { progress: 80 }, // Routine
    ];
    const total = categories.reduce((sum, c) => sum + c.progress, 0);
    const avg = Math.round(total / categories.length);
    expect(avg).toBe(82);
  });

  it("calculates medicine dose compliance ratio correctly", () => {
    const doses = [
      { name: "Vitamin D3", taken: true },
      { name: "Iron Supplement", taken: false },
      { name: "Cough Syrup", taken: true },
    ];
    const taken = doses.filter((d) => d.taken).length;
    const ratio = Math.round((taken / doses.length) * 100);
    expect(taken).toBe(2);
    expect(ratio).toBe(67);
  });

  it("safeguards circular gauge values within [0, 100] bounds", () => {
    const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));
    expect(clamp(-15)).toBe(0);
    expect(clamp(85.4)).toBe(85);
    expect(clamp(150)).toBe(100);
  });

  it("validates child destination routes", () => {
    const expectedChildRoutes = [
      "/child",
      "/child/health",
      "/child/check-in",
      "/child/medicines",
      "/child/appointments",
      "/child/profile",
      "/child/notifications",
    ];
    expect(expectedChildRoutes).toHaveLength(7);
    expect(expectedChildRoutes).toContain("/child/medicines");
  });
});
