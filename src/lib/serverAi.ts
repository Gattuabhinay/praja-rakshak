import type { ProviderAuth } from "@/lib/aiProviders";
import { isAiProvider, type AiProvider } from "@/lib/providers";

/**
 * Resolve which AI key to use on the server:
 * 1) User key from AI Settings (BYOK)
 * 2) Admin OpenRouter key from OPENROUTER_API_KEY
 * 3) Admin OpenAI key from OPENAI_API_KEY
 * 4) Admin Gemini key from GEMINI_API_KEY
 * 5) null → local / template fallback (no real AI)
 */
export function resolveServerAiAuth(input?: {
  provider?: AiProvider | null;
  apiKey?: string;
}): {
  auth: ProviderAuth | null;
  source:
    | "user"
    | "admin-openrouter"
    | "admin-openai"
    | "admin-gemini"
    | "none";
} {
  const userKey = input?.apiKey?.trim() ?? "";
  const userProvider = input?.provider;

  if (
    userKey &&
    userKey.length >= 20 &&
    userKey.length <= 512 &&
    isAiProvider(userProvider)
  ) {
    return {
      auth: { provider: userProvider, apiKey: userKey },
      source: "user",
    };
  }

  const openRouter = process.env.OPENROUTER_API_KEY?.trim() ?? "";
  if (openRouter.length >= 20) {
    return {
      auth: { provider: "openrouter", apiKey: openRouter },
      source: "admin-openrouter",
    };
  }

  const openai = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (openai.length >= 20) {
    return {
      auth: { provider: "openai", apiKey: openai },
      source: "admin-openai",
    };
  }

  const gemini = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (gemini.length >= 20) {
    return {
      auth: { provider: "gemini", apiKey: gemini },
      source: "admin-gemini",
    };
  }

  return { auth: null, source: "none" };
}

export function hasAdminAiKey() {
  const openRouter = process.env.OPENROUTER_API_KEY?.trim() ?? "";
  const openai = process.env.OPENAI_API_KEY?.trim() ?? "";
  const gemini = process.env.GEMINI_API_KEY?.trim() ?? "";
  return (
    openRouter.length >= 20 || openai.length >= 20 || gemini.length >= 20
  );
}
