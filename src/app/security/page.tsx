"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { BRAND } from "@/lib/brand";

function SecurityContent() {
  return (
    <div className="page">
      <div className="shell">
        <section className="panel">
          <p className="eyebrow">App security</p>
          <h1>{BRAND.name} security basics</h1>
          <div className="journey-strip">
            <span className="done">Login required</span>
            <span>Protected app routes</span>
            <span>Hashed passwords</span>
            <span>Official redirects only</span>
          </div>
          <ul className="guide-list">
            <li>Login/Create account is required before using the app</li>
            <li>Case history is tied to the logged-in user</li>
            <li>Passwords are hashed on device</li>
            <li>AI keys stay in browser settings</li>
            <li>Government filing happens on official redirected sites</li>
          </ul>
          <div className="action-row" style={{ marginTop: "1rem" }}>
            <Link href="/dashboard" className="btn btn-primary">
              Back to Home journey
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <RequireAuth>
      <SecurityContent />
    </RequireAuth>
  );
}
