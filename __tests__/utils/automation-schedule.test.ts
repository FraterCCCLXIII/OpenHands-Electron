import { describe, it, expect } from "vitest";
import {
  buildCronSchedule,
  buildIntervalCron,
  buildOnceCron,
  parseCronSchedule,
  parseIntervalCron,
  parseScheduleDateTime,
  parseTimeOfDay,
} from "#/utils/automation-schedule";

describe("automation-schedule", () => {
  describe("parseCronSchedule", () => {
    it("decodes Daily / Weekdays / Weekly preset cron expressions", () => {
      // Arrange — three representative preset strings the edit modal
      // needs to round-trip into UI state.
      const cases = {
        daily: "0 9 * * *",
        weekdays: "30 8 * * 1-5",
        weekly: "0 14 * * 3",
      };

      // Act
      const daily = parseCronSchedule(cases.daily);
      const weekdays = parseCronSchedule(cases.weekdays);
      const weekly = parseCronSchedule(cases.weekly);

      // Assert
      expect(daily).toEqual({ kind: "daily", hour: 9, minute: 0 });
      expect(weekdays).toEqual({ kind: "weekdays", hour: 8, minute: 30 });
      expect(weekly).toEqual({
        kind: "weekly",
        hour: 14,
        minute: 0,
        weekday: 3,
      });
    });

    it("falls back to 'custom' for cron strings that don't match a preset", () => {
      // Arrange — schedules the UI must NOT silently rewrite when saving:
      // multi-value hour, monthly DOM, missing fields, garbage.
      const inputs = ["0 9,17 * * *", "0 9 1 * *", "every 5 minutes", ""];

      // Act
      const results = inputs.map(parseCronSchedule);

      // Assert — every non-preset stays as kind: "custom".
      expect(results.every((r) => r.kind === "custom")).toBe(true);
    });
  });

  describe("buildCronSchedule", () => {
    it("emits canonical cron strings for each preset kind", () => {
      // Act
      const daily = buildCronSchedule({ kind: "daily", hour: 9, minute: 0 });
      const weekdays = buildCronSchedule({
        kind: "weekdays",
        hour: 8,
        minute: 30,
      });
      const weekly = buildCronSchedule({
        kind: "weekly",
        hour: 14,
        minute: 0,
        weekday: 3,
      });

      // Assert
      expect(daily).toBe("0 9 * * *");
      expect(weekdays).toBe("30 8 * * 1-5");
      expect(weekly).toBe("0 14 * * 3");
    });
  });

  describe("interval cron", () => {
    it("builds and parses repeating minute and hour schedules", () => {
      expect(buildIntervalCron(15, "minutes")).toBe("*/15 * * * *");
      expect(buildIntervalCron(1, "hours")).toBe("0 * * * *");
      expect(buildIntervalCron(2, "hours")).toBe("0 */2 * * *");
      expect(parseIntervalCron("*/20 * * * *")).toEqual({
        kind: "interval",
        value: 20,
        unit: "minutes",
      });
      expect(parseIntervalCron("0 * * * *")).toEqual({
        kind: "interval",
        value: 1,
        unit: "hours",
      });
      expect(parseIntervalCron("0 9 * * *")).toBeNull();
    });
  });

  describe("parseTimeOfDay", () => {
    it("parses HH:MM and rejects out-of-range or malformed values", () => {
      // Act
      const valid = parseTimeOfDay("09:30");
      const invalidHour = parseTimeOfDay("24:00");
      const malformed = parseTimeOfDay("9-30");

      // Assert
      expect(valid).toEqual({ hour: 9, minute: 30 });
      expect(invalidHour).toBeNull();
      expect(malformed).toBeNull();
    });
  });

  describe("once schedule datetime", () => {
    it("builds a one-time cron from a datetime-local value", () => {
      expect(parseScheduleDateTime("2026-08-21T16:00")).toEqual({
        minute: 0,
        hour: 16,
        day: 21,
        month: 8,
      });
      expect(buildOnceCron(parseScheduleDateTime("2026-08-21T16:00")!)).toBe(
        "0 16 21 8 *",
      );
      expect(parseScheduleDateTime("2026-02-31T09:00")).toBeNull();
    });
  });
});
