"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TelanganaBadge } from "@/components/TelanganaBadge";
import { DEMO_ACCOUNT, friendlyAuthError } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

type AuthMode = "login" | "register" | "forgot";

function LoginForm() {
  const { login, loginAsDemo, register, requestPasswordReset, user, ready } =
    useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard?section=cleanup";
  const modeParam = searchParams.get("mode");
  const initialMode: AuthMode =
    modeParam === "register"
      ? "register"
      : modeParam === "forgot"
        ? "forgot"
        : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string>(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState<string>(DEMO_ACCOUNT.password);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (ready && user && mode !== "forgot") {
      router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
    }
  }, [ready, user, router, nextPath, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "forgot") {
        await requestPasswordReset(email);
        setInfo(
          "Check your inbox. Supabase sent a password-reset email with a recovery link. Open that link to set a new password.",
        );
        return;
      }
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Could not continue";
      setError(friendlyAuthError(raw));
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "login"
      ? `Login to enter ${BRAND.name}`
      : mode === "register"
        ? "Create your account"
        : "Forgot password";

  const lede =
    mode === "forgot"
      ? "Enter your account email. Supabase will email a real reset link. Open it to choose a new password on the reset page."
      : "Login, create an account, or use the demo account to continue: Clean Up → Speak Up → Official Portal → Profile.";

  async function onDemoEnter() {
    setError(null);
    setInfo(null);
    setLoading(true);
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    try {
      await loginAsDemo();
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="auth-brand">
        <TelanganaBadge size="lg" />
        <p className="auth-state-label">{BRAND.stateOfficial}</p>
        <p className="auth-tagline">{BRAND.tagline}</p>
      </div>

      <p className="eyebrow">Required · {BRAND.state}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>

      {mode !== "forgot" ? (
        <div className="demo-box">
          <strong>Demo account (quick entry)</strong>
          <p>
            Stuck on signup? Use this for now. Email:{" "}
            <code>{DEMO_ACCOUNT.email}</code> · Password:{" "}
            <code>{DEMO_ACCOUNT.password}</code>
          </p>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => void onDemoEnter()}
            disabled={loading}
          >
            {loading ? "Entering…" : "Enter with demo account"}
          </button>
        </div>
      ) : null}

      {mode !== "forgot" ? (
        <div className="mode-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError(null);
              setInfo(null);
            }}
          >
            Create account
          </button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="auth-form">
        {mode === "register" ? (
          <label className="field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </label>
        ) : null}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            autoComplete="email"
          />
        </label>
        {mode !== "forgot" ? (
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "register" ? "Min 6 characters" : "Your password"
              }
              required
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>
        ) : null}
        {mode === "login" ? (
          <div className="auth-forgot-row">
            <button
              type="button"
              className="linkish"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setInfo(null);
              }}
            >
              Forgot password?
            </button>
          </div>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Login & enter app"
              : mode === "register"
                ? "Create account & enter app"
                : "Send reset email via Supabase"}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
        {info ? <p className="success-text">{info}</p> : null}
      </form>

      {mode === "login" ? (
        <div className="auth-links">
          <span>New here?</span>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setMode("register");
              setError(null);
              setInfo(null);
            }}
          >
            Create account
          </button>
        </div>
      ) : null}
      {mode === "register" ? (
        <div className="auth-links">
          <span>Already have an account?</span>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
          >
            Login
          </button>
        </div>
      ) : null}
      {mode === "forgot" ? (
        <div className="auth-links">
          <span>Remembered it?</span>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
          >
            Back to Login
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default function LoginPage() {
  return (
    <div className="page entry-page">
      <div className="shell auth-shell">
        <Suspense
          fallback={
            <section className="panel">
              <p className="lede">Loading login…</p>
            </section>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
