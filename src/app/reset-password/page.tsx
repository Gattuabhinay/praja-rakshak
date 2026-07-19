"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { updatePassword } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    async function boot() {
      // Exchange ?code=... if Supabase redirected with PKCE.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && mounted) {
          setError(exchangeError.message);
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(Boolean(data.session));
      setReady(true);
    }

    void boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setHasSession(Boolean(session));
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => router.replace("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="auth-brand">
        <Image
          src={BRAND.logoSrc}
          alt={`${BRAND.name} logo`}
          width={720}
          height={720}
          className="auth-logo"
          priority
        />
        <p className="auth-tagline">{BRAND.tagline}</p>
      </div>
      <p className="eyebrow">Password recovery · {BRAND.name}</p>
      <h1>Set a new password</h1>
      <p className="lede">
        Open the reset link from your email, then choose a new password. Supabase
        verified this recovery session.
      </p>

      {!ready ? (
        <p className="engine-tag">Checking recovery link…</p>
      ) : !hasSession ? (
        <>
          <p className="error-text">
            No valid reset session found. Request a new email from Forgot
            password, then open the latest link from Supabase.
          </p>
          <Link className="btn btn-primary" href="/login?mode=forgot">
            Back to Forgot password
          </Link>
        </>
      ) : done ? (
        <p className="engine-tag">
          Password updated. Redirecting you to login…
        </p>
      ) : (
        <form onSubmit={onSubmit} className="auth-form">
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="page entry-page">
      <div className="shell auth-shell">
        <Suspense
          fallback={
            <section className="panel">
              <p className="lede">Loading reset form…</p>
            </section>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
