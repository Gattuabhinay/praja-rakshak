export type AiProvider = "openrouter" | "openai" | "gemini" | "claude";

export const AI_PROVIDERS: Record<
  AiProvider,
  {
    label: string;
    helper: string;
    keyPlaceholder: string;
    docsUrl: string;
    defaultModel: string;
  }
> = {
  openrouter: {
    label: "OpenRouter",
    helper:
      "Fully supported. Paste your OpenRouter key for Clean Up (vision), Speak Up drafts, and Other-case AI analysis.",
    keyPlaceholder: "sk-or-v1-...",
    docsUrl: "https://openrouter.ai/keys",
    // gemini-2.0-flash-001 often returns "No endpoints found" on OpenRouter now
    defaultModel: "google/gemini-2.5-flash",
  },
  openai: {
    label: "OpenAI ChatGPT",
    helper:
      "Use your OpenAI API key for GPT vision (Clean Up) and ChatGPT-style drafting in Speak Up.",
    keyPlaceholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
  },
  gemini: {
    label: "Google Gemini",
    helper: "Use your own Gemini API key from Google AI Studio.",
    keyPlaceholder: "AIza...",
    docsUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
  },
  claude: {
    label: "Anthropic Claude",
    helper: "Use your Anthropic API key for Claude vision + drafting.",
    keyPlaceholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-3-5-sonnet-latest",
  },
};

export function isAiProvider(value: unknown): value is AiProvider {
  return (
    value === "openrouter" ||
    value === "openai" ||
    value === "gemini" ||
    value === "claude"
  );
}
