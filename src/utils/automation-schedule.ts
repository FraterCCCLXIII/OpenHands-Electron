export type SchedulePresetKind = "daily" | "weekdays" | "weekly";

export interface PresetSchedule {
  kind: SchedulePresetKind;
  hour: number;
  minute: number;
  weekday?: number;
}

export interface CustomSchedule {
  kind: "custom";
  raw: string;
  hour?: number;
  minute?: number;
}

export type ParsedSchedule = PresetSchedule | CustomSchedule;

const SINGLE_INT = /^(\d+)$/;

function parseSingleInt(
  field: string,
  min: number,
  max: number,
): number | null {
  const match = field.match(SINGLE_INT);
  if (!match) return null;
  const value = Number(match[1]);
  if (Number.isNaN(value) || value < min || value > max) return null;
  return value;
}

export function parseCronSchedule(
  cron: string | undefined | null,
): ParsedSchedule {
  const raw = (cron ?? "").trim();
  if (!raw) return { kind: "custom", raw: "" };

  const fields = raw.split(/\s+/);
  if (fields.length !== 5) return { kind: "custom", raw };

  const [minuteField, hourField, domField, monthField, dowField] = fields;

  const minute = parseSingleInt(minuteField, 0, 59);
  const hour = parseSingleInt(hourField, 0, 23);

  if (minute === null || hour === null) {
    return { kind: "custom", raw };
  }
  if (domField !== "*" || monthField !== "*") {
    return { kind: "custom", raw, hour, minute };
  }

  if (dowField === "*" || dowField === "0-6") {
    return { kind: "daily", hour, minute };
  }
  if (dowField === "1-5") {
    return { kind: "weekdays", hour, minute };
  }
  const weekday = parseSingleInt(dowField, 0, 6);
  if (weekday !== null) {
    return { kind: "weekly", hour, minute, weekday };
  }
  return { kind: "custom", raw, hour, minute };
}

export function buildCronSchedule(input: PresetSchedule): string {
  const { kind, hour, minute, weekday } = input;
  switch (kind) {
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekdays":
      return `${minute} ${hour} * * 1-5`;
    case "weekly":
      return `${minute} ${hour} * * ${weekday ?? 1}`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function formatTimeOfDay(hour: number, minute: number): string {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseTimeOfDay(
  value: string,
): { hour: number; minute: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

export interface ScheduleDateTimeParts {
  minute: number;
  hour: number;
  day: number;
  month: number;
}

export function formatScheduleDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function defaultScheduleDateTimeLocal(): string {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(0);
  date.setHours(date.getHours() + 1);
  return formatScheduleDateTimeLocal(date);
}

export function parseScheduleDateTime(
  value: string,
): ScheduleDateTimeParts | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const parsed = new Date(Number(match[1]), month - 1, day, hour, minute);
  if (
    parsed.getFullYear() !== Number(match[1]) ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return { minute, hour, day, month };
}

export function buildOnceCron(input: ScheduleDateTimeParts): string {
  const { minute, hour, day, month } = input;
  return `${minute} ${hour} ${day} ${month} *`;
}

export function formatEventOn(on: string | string[] | undefined): string {
  if (!on) return "—";
  if (Array.isArray(on)) return on.join(", ");
  return on;
}

export const SCHEDULE_INTERVAL_UNITS = ["minutes", "hours"] as const;

export type ScheduleIntervalUnit = (typeof SCHEDULE_INTERVAL_UNITS)[number];

export interface IntervalSchedule {
  kind: "interval";
  value: number;
  unit: ScheduleIntervalUnit;
}

export function clampScheduleInterval(
  value: number,
  unit: ScheduleIntervalUnit,
): number {
  const max = unit === "minutes" ? 59 : 23;
  return Math.min(max, Math.max(1, Math.trunc(value)));
}

export function buildIntervalCron(
  value: number,
  unit: ScheduleIntervalUnit,
): string {
  const interval = clampScheduleInterval(value, unit);
  if (unit === "minutes") return `*/${interval} * * * *`;
  if (interval === 1) return "0 * * * *";
  return `0 */${interval} * * *`;
}

export function parseIntervalCron(
  cron: string | undefined | null,
): IntervalSchedule | null {
  const raw = (cron ?? "").trim();
  const minuteMatch = raw.match(/^\*\/(\d+) \* \* \* \*$/);
  if (minuteMatch) {
    const value = Number(minuteMatch[1]);
    if (value >= 1 && value <= 59) {
      return { kind: "interval", value, unit: "minutes" };
    }
  }
  if (raw === "0 * * * *") {
    return { kind: "interval", value: 1, unit: "hours" };
  }
  const hourMatch = raw.match(/^0 \*\/(\d+) \* \* \*$/);
  if (hourMatch) {
    const value = Number(hourMatch[1]);
    if (value >= 1 && value <= 23) {
      return { kind: "interval", value, unit: "hours" };
    }
  }
  return null;
}
