export type Gender = "female" | "male" | "other";

export interface BirthInfo {
  name: string;
  /** ISO date string, e.g. "1998-05-20" */
  birthDate: string;
  /** "HH:mm", empty when unknown */
  birthTime: string;
  isBirthTimeUnknown: boolean;
  gender: Gender;
}

export interface FortuneCategory {
  score: number;
  description: string;
  /** Short Korean tags describing this score's theme - reserved for a future AI narration step. */
  keywords: string[];
}

export interface FortuneResult {
  overall: FortuneCategory;
  wealth: FortuneCategory;
  love: FortuneCategory;
  career: FortuneCategory;
  health: FortuneCategory;
  message: string;
  luckyColor: {
    name: string;
    hex: string;
  };
  luckyNumber: number;
}

export type FortuneFormErrors = Partial<
  Record<"name" | "birthDate" | "birthTime" | "gender", string>
>;
