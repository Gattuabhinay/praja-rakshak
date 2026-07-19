import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

/** Always-available judge / demo credentials (local fallback if Supabase fails). */
export const DEMO_ACCOUNT = {
  name: "Demo Citizen",
  email: "demo@prajarakshak.ts",
  password: "Telangana@2026",
} as const;

const DEMO_SESSION_KEY = "praja_rakshak_demo_session_v1";

function readDemoSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDemoSession(user: AuthUser) {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

function clearDemoSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function isDemoUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.id?.startsWith("demo-") || user?.email === DEMO_ACCOUNT.email);
}

function localDemoUser(): AuthUser {
  return {
    id: "demo-local-citizen",
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
  };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const demo = readDemoSession();
  if (demo) return demo;

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const email = data.user.email ?? "";
  const metaName = String(data.user.user_metadata?.full_name ?? "").trim();

  const { data: profile } = await supabase
    .from("prajasetu_profiles")
    .select("full_name,email")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: profile?.email || email,
    name: profile?.full_name || metaName || email.split("@")[0] || "Citizen",
  };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();

  // Demo credentials always work — try Supabase, then local session.
  if (
    cleanEmail === DEMO_ACCOUNT.email &&
    password === DEMO_ACCOUNT.password
  ) {
    return loginAsDemo();
  }

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });
  if (error) throw new Error(error.message);
  clearDemoSession();
  const user = await getSessionUser();
  if (!user) throw new Error("Login succeeded but session was not found.");
  return user;
}

/** One-click demo entry for judges / stuck users. */
export async function loginAsDemo(): Promise<AuthUser> {
  const supabase = getSupabaseBrowserClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    if (!error) {
      clearDemoSession();
      const user = await getSessionUser();
      if (user) return user;
    }
  } catch {
    // fall through
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      options: {
        data: {
          full_name: DEMO_ACCOUNT.name,
          state: "Telangana",
        },
      },
    });
    if (!error && data.session) {
      clearDemoSession();
      await supabase.from("prajasetu_profiles").upsert({
        id: data.user!.id,
        full_name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
        state: "Telangana",
      });
      const user = await getSessionUser();
      if (user) return user;
    }
  } catch {
    // fall through to local demo
  }

  const user = localDemoUser();
  writeDemoSession(user);
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  return user;
}

/** Map scary provider messages into calm, actionable copy. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("over_email_send_rate_limit")) {
    return "Supabase email limit hit (too many signup/reset emails). Wait 30–60 minutes, try Login if the account already exists, or use the Demo account. For judging: turn OFF Confirm email in Supabase Auth settings.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "This email already has an account. Switch to Login, or use Forgot password.";
  }
  return message;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || !cleanEmail || password.length < 6) {
    throw new Error("Enter name, valid email, and password (min 6 chars).");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
        state: "Telangana",
      },
    },
  });

  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.user) throw new Error("Could not create account.");

  clearDemoSession();

  // Ensure profile row exists even if trigger is delayed.
  await supabase.from("prajasetu_profiles").upsert({
    id: data.user.id,
    full_name: cleanName,
    email: cleanEmail,
    state: "Telangana",
  });

  // If email confirmation is enabled and no session yet:
  if (!data.session) {
    throw new Error(
      "Account created. Confirm your email (if required), then Login — or disable Confirm email in Supabase for instant demo signup.",
    );
  }

  const user = await getSessionUser();
  if (!user) throw new Error("Account created but session was not found.");
  return user;
}

export async function logout() {
  clearDemoSession();
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}

/** Sends a real Supabase password-reset email with a recovery link. */
export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("Enter the email linked to your account.");

  const supabase = getSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}

/** Sets a new password after the user opens the Supabase recovery email link. */
export async function updatePassword(newPassword: string): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error(
      "Reset link is missing or expired. Request a new forgot-password email, then open the latest link.",
    );
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
