"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  clearAiSettings,
  getAiSettings,
  saveAiSettings,
} from "@/lib/aiSettings";
import { AI_PROVIDERS, type AiProvider } from "@/lib/providers";

type AiSettingsPanelProps = {
  /** Compact panel under Profile vs full settings page */
  compact?: boolean;
};

export function AiSettingsPanel({ compact = false }: AiSettingsPanelProps) {
  const [provider, setProvider] = useState<AiProvider>("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [adminReady, setAdminReady] = useState<boolean | null>(null);

  useEffect(() => {
    const current = getAiSettings();
    setProvider(current.provider);
    setApiKey(current.apiKey);

    void fetch("/api/ai-status")
      .then((res) => res.json())
      .then((data: { adminReady?: boolean }) => {
        setAdminReady(Boolean(data.adminReady));
      })
      .catch(() => setAdminReady(false));
  }, []);

  function onSave(e: FormEvent) {
    e.preventDefault();
    saveAiSettings({ provider, apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const meta = AI_PROVIDERS[provider];

  return (
    <section className="panel" id="ai-settings">
      <p className="eyebrow">Optional · your API key</p>
      <h2>{compact ? "AI / API settings" : "AI Settings"}</h2>
      <p className="lede">
        Optional personal key (OpenRouter / OpenAI ChatGPT / Gemini / Claude).
        Leave empty to use the server admin key. Only if both are missing does
        the app fall back to local / template mode.
      </p>

      <p className="engine-tag">
        {apiKey.trim()
          ? `Personal ${AI_PROVIDERS[provider].label} key will be used`
          : adminReady
            ? "No personal key · admin OpenRouter AI active"
            : adminReady === false
              ? "No personal key · admin key not detected"
              : "Checking admin AI status…"}
      </p>

      <form onSubmit={onSave} className="auth-form profile-form">
        <label className="field">
          <span>Provider</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiProvider)}
          >
            {(Object.keys(AI_PROVIDERS) as AiProvider[]).map((key) => (
              <option key={key} value={key}>
                {AI_PROVIDERS[key].label}
              </option>
            ))}
          </select>
        </label>

        <div className="guide-box ai-provider-card">
          <h3>{meta.label}</h3>
          <p>{meta.helper}</p>
          <div className="get-key-cta">
            <div className="get-key-copy">
              <strong>Need an API key?</strong>
              <span>Open the official {meta.label} page, create a key, then paste it below.</span>
            </div>
            <a
              className="btn btn-get-key"
              href={meta.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get {meta.label} key
              <span className="get-key-arrow" aria-hidden>
                ↗
              </span>
            </a>
          </div>
        </div>

        <label className="field">
          <span>Your API key</span>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={meta.keyPlaceholder}
            autoComplete="off"
          />
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={showKey}
            onChange={(e) => setShowKey(e.target.checked)}
          />
          <span>Show API key</span>
        </label>

        <div className="action-row">
          <button type="submit" className="btn btn-primary">
            Save AI settings
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              clearAiSettings();
              setApiKey("");
              setProvider("openrouter");
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            Clear key
          </button>
        </div>
        {saved ? <p className="success-text">Saved.</p> : null}
      </form>
    </section>
  );
}
