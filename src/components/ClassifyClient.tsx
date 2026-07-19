"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AiKeyBadge } from "@/components/AiKeyBadge";
import { JourneyStrip } from "@/components/JourneyStrip";
import { getAiSettings } from "@/lib/aiSettings";
import { saveClassification } from "@/lib/session";
import type { ClassificationResult } from "@/lib/types";

export function ClassifyClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  function onFile(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selected);
  }

  async function classify() {
    if (!file) {
      setError("Upload a clear waste photo first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const settings = getAiSettings();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("fileName", file.name);
      formData.append("provider", settings.provider);
      formData.append("apiKey", settings.apiKey);

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Classification failed");
      }

      const next = data as ClassificationResult;
      setResult(next);
      saveClassification(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-grid">
      <section className="panel">
        <p className="eyebrow">Step 1 · Clean Up</p>
        <h1>Upload waste. Get the correct bin.</h1>
        <JourneyStrip active="cleanup" authed />
        <AiKeyBadge />

        <div
          className="dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0] ?? null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Waste preview" className="preview-image" />
          ) : (
            <div className="dropzone-empty">
              <strong>Drop a photo or tap to browse</strong>
              <span>JPG, PNG, WEBP · under 8MB · close-up works best</span>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        <div className="action-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={classify}
            disabled={loading || !file}
          >
            {loading ? "AI is reading the photo…" : "Classify with AI"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
              setError(null);
            }}
          >
            Reset
          </button>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel result-panel">
        <p className="eyebrow">Step 2 · Result</p>
        {!result ? (
          <div className="empty-result">
            <h2>Your AI result appears here</h2>
            <p>
              Tip: photograph one item at a time — food scraps, plastic bottle,
              battery, or charger — for the cleanest demo.
            </p>
          </div>
        ) : (
          <div className="result-body animate-in">
            <div className="result-top">
              <div>
                <p className="category-kicker">{result.binColor}</p>
                <h2>{result.label}</h2>
              </div>
              <div className="confidence">
                <span>{Math.round(result.confidence * 100)}%</span>
                <small>confidence</small>
              </div>
            </div>

            <p>{result.summary}</p>
            <p className="telugu-tip">{result.teluguTip}</p>

            <div className="tips-grid">
              <div>
                <h3>Do this</h3>
                <ul>
                  {result.doList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Avoid</h3>
                <ul>
                  {result.dontList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="engine-tag">
              Engine:{" "}
              {result.engine === "gemini-vision"
                ? "Gemini Vision (your key)"
                : result.engine === "openrouter-vision"
                  ? "OpenRouter Vision (your key)"
                  : result.engine === "openai-vision"
                    ? "OpenAI ChatGPT Vision (your key)"
                    : result.engine === "claude-vision"
                      ? "Claude Vision (your key)"
                      : "Local vision fallback (add key in AI Settings)"}
            </p>

            <button
              type="button"
              className="btn btn-accent"
              onClick={() => router.push("/dashboard?section=speakup")}
            >
              Next · Speak Up (file a complaint)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
