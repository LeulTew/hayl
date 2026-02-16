import { describe, expect, it } from "bun:test";
import {
  buildReorderedDayOrder,
  calculateStreakDaysFromLogs,
  normalizeDayOrder,
  resolveNextDayIndex,
  type DayOrderEntry,
} from "./routinesLogic";

const planDays = [{ dayIndex: 0 }, { dayIndex: 1 }, { dayIndex: 2 }];

describe("routinesLogic", () => {
  it("normalizes persisted day order and fills missing days", () => {
    const persisted: DayOrderEntry[] = [
      { dayIndex: 2, day_order: 0 },
      { dayIndex: 0, day_order: 1 },
    ];

    const result = normalizeDayOrder(planDays, persisted);

    expect(result).toEqual([
      { dayIndex: 2, day_order: 0 },
      { dayIndex: 0, day_order: 1 },
      { dayIndex: 1, day_order: 2 },
    ]);
  });

  it("rejects invalid reorder payloads", () => {
    expect(() => buildReorderedDayOrder(planDays, [2, 0])).toThrow();
    expect(() => buildReorderedDayOrder(planDays, [2, 0, 0])).toThrow();
    expect(() => buildReorderedDayOrder(planDays, [2, 0, 99])).toThrow();
  });

  it("recalculates next day from completed count after reorder", () => {
    const defaultOrder = normalizeDayOrder(planDays);
    const reordered = buildReorderedDayOrder(planDays, [2, 0, 1]);

    const completedCount = 4;

    expect(resolveNextDayIndex(completedCount, defaultOrder)).toBe(1);
    expect(resolveNextDayIndex(completedCount, reordered)).toBe(0);
  });

  it("calculates streak from unique local days and ignores same-day duplicates", () => {
    const now = new Date(2026, 1, 16, 12, 0, 0).getTime();

    const day0 = new Date(2026, 1, 16, 9, 0, 0).getTime();
    const day0Duplicate = new Date(2026, 1, 16, 18, 0, 0).getTime();
    const day1 = new Date(2026, 1, 15, 10, 0, 0).getTime();
    const day2 = new Date(2026, 1, 14, 8, 0, 0).getTime();

    const streak = calculateStreakDaysFromLogs(
      [
        { completedAt: day0 },
        { completedAt: day0Duplicate },
        { completedAt: day1 },
        { completedAt: day2 },
      ],
      now,
    );

    expect(streak).toBe(3);
  });

  it("returns zero streak when there is no activity today or yesterday", () => {
    const now = new Date(2026, 1, 16, 12, 0, 0).getTime();
    const oldDay = new Date(2026, 1, 12, 9, 0, 0).getTime();

    const streak = calculateStreakDaysFromLogs([{ completedAt: oldDay }], now);
    expect(streak).toBe(0);
  });
});
