import type { ClassificationResult } from "./types";

const KEY = "praja_rakshak_last_result";

export function saveClassification(result: ClassificationResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(result));
}

export function loadClassification(): ClassificationResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClassificationResult;
  } catch {
    return null;
  }
}
