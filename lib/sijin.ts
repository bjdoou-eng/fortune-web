/**
 * The traditional Korean/East-Asian twelve double-hours (십이시진).
 * Each spans 2 hours; `value` is the representative "HH:mm" stored in
 * BirthInfo.birthTime (the slot's start hour) and used as the fortune seed.
 */
export interface SijinOption {
  key: string;
  label: string;
  startHour: number;
  endHour: number;
  value: string;
}

const SIJIN_LABELS_BY_START_HOUR: [string, number][] = [
  ["자시", 23],
  ["축시", 1],
  ["인시", 3],
  ["묘시", 5],
  ["진시", 7],
  ["사시", 9],
  ["오시", 11],
  ["미시", 13],
  ["신시", 15],
  ["유시", 17],
  ["술시", 19],
  ["해시", 21],
];

function pad(hour: number): string {
  return String(hour).padStart(2, "0");
}

export const SIJIN_OPTIONS: SijinOption[] = SIJIN_LABELS_BY_START_HOUR.map(([label, startHour], index) => ({
  key: `sijin-${index}`,
  label,
  startHour,
  endHour: (startHour + 2) % 24,
  value: `${pad(startHour)}:00`,
}));

export function findSijinByValue(value: string): SijinOption | undefined {
  return SIJIN_OPTIONS.find((option) => option.value === value);
}

export function formatSijinRange(option: SijinOption, style: "short" | "full" = "full"): string {
  if (style === "short") return `${pad(option.startHour)}~${pad(option.endHour)}`;
  return `${pad(option.startHour)}:00 ~ ${pad(option.endHour)}:00`;
}
