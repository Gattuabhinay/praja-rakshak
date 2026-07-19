"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { AiSettingsPanel } from "@/components/AiSettingsPanel";

function SettingsContent() {
  return (
    <div className="page">
      <div className="shell">
        <AiSettingsPanel />
        <div className="action-row" style={{ marginTop: "1rem" }}>
          <Link href="/dashboard?section=cleanup" className="btn btn-accent">
            Continue to Clean Up
          </Link>
          <Link
            href="/dashboard?section=profile#ai-settings"
            className="btn btn-ghost"
          >
            Open in Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
