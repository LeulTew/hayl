import { describe, expect, test } from "vitest";
import { getIncompleteWorkoutMessage, type CompletionStats } from "./ux-constants";

describe("Workout UX Logic - Warnings", () => {
  const baseStats: CompletionStats = {
    totalExercises: 5,
    completedExercises: 0,
    totalSets: 20,
    completedSets: 0,
    skippedExercises: [],
    partialExercises: []
  };

  test("Empty session returns discard message", () => {
    const warning = getIncompleteWorkoutMessage(baseStats);
    expect(warning.severity).toBe("info");
    expect(warning.confirmLabel).toBe("Discard Session");
  });

  test("Fully complete session returns success message", () => {
    const stats = { ...baseStats, completedExercises: 5, completedSets: 20 };
    const warning = getIncompleteWorkoutMessage(stats);
    expect(warning.severity).toBe("none");
    expect(warning.title).toBe("Workout Complete!");
  });

  test("Skipped exercises are listed specifically", () => {
    const stats: CompletionStats = {
      ...baseStats,
      completedSets: 10,
      skippedExercises: ["Squats", "Lunges"],
    };
    const warning = getIncompleteWorkoutMessage(stats);
    expect(warning.message).toContain("Skipped: Squats, Lunges");
    expect(warning.severity).toBe("warning");
  });

  test("Partial exercises show set counts", () => {
    const stats: CompletionStats = {
      ...baseStats,
      completedSets: 15,
      partialExercises: [{ name: "Bench Press", setsDone: 2, setsTotal: 4 }],
    };
    const warning = getIncompleteWorkoutMessage(stats);
    expect(warning.message).toContain("Incomplete: Bench Press (2/4)");
  });

  test("Mixed incomplete state formats correctly", () => {
    const stats: CompletionStats = {
      ...baseStats,
      completedSets: 10,
      skippedExercises: ["Pullups"],
      partialExercises: [{ name: "Dips", setsDone: 1, setsTotal: 3 }],
    };
    const warning = getIncompleteWorkoutMessage(stats);
    expect(warning.message).toContain("Skipped: Pullups");
    expect(warning.message).toContain("Incomplete: Dips (1/3)");
    expect(warning.message).toContain("It's okay to stop here"); // Non-punitive check
  });
});
