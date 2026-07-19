import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FeedbackCategory =
  | "suggestion"
  | "bug"
  | "ux_review"
  | "feature_idea"
  | "other";

export const FEEDBACK_CATEGORIES: Array<{
  id: FeedbackCategory;
  label: string;
}> = [
  { id: "suggestion", label: "Suggestion to improve the app" },
  { id: "ux_review", label: "UI / UX review note" },
  { id: "feature_idea", label: "New feature idea" },
  { id: "bug", label: "Something not working" },
  { id: "other", label: "Other advisory feedback" },
];

export type FeedbackInput = {
  userId?: string | null;
  name?: string;
  email?: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
  pageContext?: string;
};

const LOCAL_FEEDBACK_KEY = "praja_rakshak_local_feedback";

function saveLocalFeedback(input: FeedbackInput & { message: string }) {
  if (typeof window === "undefined") return;
  const prev = JSON.parse(
    window.localStorage.getItem(LOCAL_FEEDBACK_KEY) || "[]",
  ) as unknown[];
  prev.unshift({
    ...input,
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  window.localStorage.setItem(
    LOCAL_FEEDBACK_KEY,
    JSON.stringify(prev.slice(0, 50)),
  );
}

export async function submitFeedback(input: FeedbackInput) {
  const message = input.message.trim();
  if (message.length < 10) {
    throw new Error("Please write at least a short suggestion (10+ characters).");
  }
  if (message.length > 4000) {
    throw new Error("Feedback is too long (max 4000 characters).");
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Please choose a rating from 1 to 5.");
  }

  const isLocalDemo =
    !input.userId ||
    input.userId.startsWith("demo-") ||
    input.email === "demo@prajarakshak.ts";

  const row = {
    user_id: isLocalDemo ? null : input.userId || null,
    name: input.name?.trim() || null,
    email: input.email?.trim() || null,
    rating: input.rating,
    category: input.category,
    message,
    page_context: input.pageContext || "profile",
  };

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("prajasetu_feedback").insert(row);

  if (!error) return;

  // Demo sessions may not have a Supabase auth user — keep the note locally
  if (isLocalDemo) {
    saveLocalFeedback({ ...input, message });
    return;
  }

  throw new Error(error.message);
}
