import { describe, it, expect } from "vitest";
import {
  calculateHealthStatus,
  calculateLifestyleScore,
  getDefaultHealthData,
  HealthData,
} from "@/types/health";

describe("Health Analysis & Calculations", () => {
  it("should return stable for default healthy values", () => {
    const data = getDefaultHealthData();
    data.stepsCount = 5000;
    const status = calculateHealthStatus(data);
    expect(status).toBe("stable");
  });

  it("should return moderate when 2 to 4 risk indicators are present", () => {
    const data: HealthData = {
      ...getDefaultHealthData(),
      moodScore: 1, // +1
      waterIntake: 2, // +1
      sleepHours: 4, // +1
      stepsCount: 2000,
    };
    const status = calculateHealthStatus(data);
    expect(status).toBe("moderate");
  });

  it("should return critical when risk factors reach threshold (>= 5)", () => {
    const data: HealthData = {
      ...getDefaultHealthData(),
      hadFall: true, // +2
      sosActivated: true, // +3
    };
    const status = calculateHealthStatus(data);
    expect(status).toBe("critical");
  });

  it("should calculate lifestyle score correctly within 0-100 scale", () => {
    const data = getDefaultHealthData();
    data.sleepHours = 8;
    data.moodScore = 5;
    data.stepsCount = 8000;
    data.exerciseMinutes = 30;
    data.mealsEaten = 3;
    data.waterIntake = 8;
    data.medicationTaken = true;
    data.feltSafe = true;
    data.hadFall = false;

    const score = calculateLifestyleScore(data);
    expect(score).toBe(100);
  });

  it("should handle minimal activity and poor lifestyle gracefully", () => {
    const data: HealthData = {
      ...getDefaultHealthData(),
      sleepHours: 0,
      moodScore: 1,
      stepsCount: 0,
      exerciseMinutes: 0,
      mealsEaten: 0,
      waterIntake: 0,
      medicationTaken: false,
      feltSafe: false,
      hadFall: true,
    };
    const score = calculateLifestyleScore(data);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(30);
  });
});
