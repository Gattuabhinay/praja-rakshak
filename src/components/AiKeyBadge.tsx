"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAiSettings } from "@/lib/aiSettings";
import { AI_PROVIDERS } from "@/lib/providers";

export function AiKeyBadge() {
  const [label, setLabel] = useState("Checking AI…");

  useEffect(() => {
    const settings = getAiSettings();
    if (settings.apiKey) {
      setLabel(`${AI_PROVIDERS[settings.provider].label} key ready`);
      return;
    }

    void fetch("/api/ai-status")
      .then((res) => res.json())
      .then((data: { adminReady?: boolean }) => {
        setLabel(
          data.adminReady
            ? "No personal key · admin OpenRouter AI active"
            : "No API key · local / template fallback",
        );
      })
      .catch(() => {
        setLabel("No API key · local / template fallback");
      });
  }, []);

  return (
    <div className="ai-badge">
      <span>{label}</span>
      <Link href="/dashboard?section=profile#ai-settings">AI Settings</Link>
    </div>
  );
}
