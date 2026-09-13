import type { BirthInfo } from "@/types/fortune";

const STORAGE_KEY = "fortune-birth-info";

/**
 * Reads previously saved birth info from localStorage.
 * Always returns null on the server or when storage is unavailable/corrupted,
 * so callers can safely use it inside a useEffect without hydration mismatches.
 */
export function loadBirthInfo(): BirthInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BirthInfo;
  } catch {
    return null;
  }
}

export function saveBirthInfo(info: BirthInfo): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Storage unavailable (private mode, quota exceeded, etc.) - ignore silently.
  }
}
