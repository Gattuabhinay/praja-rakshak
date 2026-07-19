import { isAiProvider, type AiProvider } from "./providers";

export type AiSettings = {
  provider: AiProvider;
  apiKey: string;
};

const KEY = "praja_rakshak_ai_settings_v1";

export function getAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return { provider: "openrouter", apiKey: "" };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { provider: "openrouter", apiKey: "" };
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    const provider = isAiProvider(parsed.provider)
      ? parsed.provider
      : "openrouter";
    return {
      provider,
      apiKey: String(parsed.apiKey ?? "").trim(),
    };
  } catch {
    return { provider: "openrouter", apiKey: "" };
  }
}

export function saveAiSettings(settings: AiSettings) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      provider: settings.provider,
      apiKey: settings.apiKey.trim(),
    }),
  );
}

export function clearAiSettings() {
  localStorage.removeItem(KEY);
}

export function hasUserApiKey() {
  return Boolean(getAiSettings().apiKey);
}
