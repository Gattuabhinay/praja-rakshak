"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
  submitFeedback,
} from "@/lib/feedback";

export function FeedbackPanel() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user?.name, user?.email]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk("");
    setError("");
    try {
      await submitFeedback({
        userId: user?.id,
        name,
        email,
        rating,
        category,
        message,
        pageContext: "profile-advisory",
      });
      setOk(
        "Thank you. Your advisory note was received — it helps us make Praja Rakshak clearer and more useful for citizens.",
      );
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel" id="suggestions">
      <p className="eyebrow">Advisory review</p>
      <h2>Suggestions &amp; review</h2>
      <p className="lede">
        This is not a complaint case. Use this space only to advise us — what
        should be clearer, faster, or more useful so the web app stays efficient
        for Telangana citizens.
      </p>

      <form className="auth-form profile-form" onSubmit={onSubmit}>
        <div className="profile-form-grid">
          <label className="field">
            <span>Your name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How we may refer to you"
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>Email (optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="If you want a follow-up"
              autoComplete="email"
            />
          </label>
          <label className="field profile-field-wide">
            <span>What kind of note is this?</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            >
              {FEEDBACK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="rating-fieldset">
          <legend>How useful is the app right now?</legend>
          <div className="rating-row" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={`rating-chip${rating === n ? " active" : ""}`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                />
                {n}
              </label>
            ))}
          </div>
          <p className="engine-tag">1 = needs work · 5 = very helpful</p>
        </fieldset>

        <label className="field">
          <span>Your suggestion or review</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Make Official Portal steps shorter on mobile… or explain Women Safety redirects more clearly…"
            required
            minLength={10}
            maxLength={4000}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Sending…" : "Send advisory suggestion"}
        </button>
        {ok ? <p className="success-text">{ok}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}
