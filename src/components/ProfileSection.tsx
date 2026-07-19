"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AiSettingsPanel } from "@/components/AiSettingsPanel";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { JourneyStrip } from "@/components/JourneyStrip";
import { TelanganaBadge } from "@/components/TelanganaBadge";
import { isDemoUser } from "@/lib/auth";
import {
  deleteCase,
  getCaseStats,
  getCasesForUser,
  type SavedCase,
} from "@/lib/cases";
import {
  getCitizenProfile,
  profileCompleteness,
  saveCitizenProfile,
  TELANGANA_DISTRICTS,
  type CitizenProfile,
} from "@/lib/profile";
import { CASE_DOMAINS, ISSUE_LABELS } from "@/lib/telangana";

export function ProfileSection() {
  const { user } = useAuth();
  const localDemo = Boolean(user && isDemoUser(user) && user.id.startsWith("demo-"));

  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [cases, setCases] = useState<SavedCase[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    drafted: 0,
    redirected: 0,
    shared: 0,
  });
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const completeness = useMemo(
    () => (profile ? profileCompleteness(profile) : null),
    [profile],
  );

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const next = await getCitizenProfile({
          userId: user!.id,
          email: user!.email,
          name: user!.name,
          isLocalDemo: localDemo,
        });
        if (mounted) setProfile(next);
      } catch (err) {
        if (mounted) {
          setProfileError(
            err instanceof Error ? err.message : "Could not load profile",
          );
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);
      if (localDemo) {
        setCases([]);
        setStats({ total: 0, drafted: 0, redirected: 0, shared: 0 });
        setHistoryError(
          "Demo mode: create a real account to keep case history in your profile.",
        );
        setHistoryLoading(false);
        return;
      }
      try {
        const [nextCases, nextStats] = await Promise.all([
          getCasesForUser(user!.id),
          getCaseStats(user!.id),
        ]);
        if (mounted) {
          setCases(nextCases);
          setStats(nextStats);
        }
      } catch (err) {
        if (mounted) {
          setHistoryError(
            err instanceof Error ? err.message : "Could not load history",
          );
        }
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    }

    void loadProfile();
    void loadHistory();
    return () => {
      mounted = false;
    };
  }, [user, localDemo]);

  if (!user) return null;

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveMsg(null);
    setProfileError(null);
    try {
      const saved = await saveCitizenProfile(profile, { isLocalDemo: localDemo });
      setProfile(saved);
      setSaveMsg(
        localDemo
          ? "Demo profile saved on this device."
          : "Profile saved. These details help when filing official complaints.",
      );
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof CitizenProfile>(
    key: K,
    value: CitizenProfile[K],
  ) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const initials = (profile?.fullName || user.name || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="profile-page animate-in">
      <section className="panel profile-hero-panel">
        <div className="profile-hero-top">
          <TelanganaBadge size="sm" />
          <JourneyStrip active="profile" authed />
        </div>

        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden>
            {initials || "PR"}
          </div>
          <div className="profile-hero-copy">
            <p className="eyebrow">Citizen profile</p>
            <h1>{profile?.fullName || user.name}</h1>
            <p className="lede">
              Keep your details ready for official portals, track cases you
              prepared, and leave advisory suggestions so we can keep this web
              app efficient for citizens.
            </p>
            <p className="engine-tag">{user.email}</p>
          </div>
          {completeness ? (
            <div className="profile-complete-card">
              <strong>{completeness.percent}%</strong>
              <span>Profile complete</span>
              <div className="profile-progress">
                <i style={{ width: `${completeness.percent}%` }} />
              </div>
              <small>
                {completeness.ready
                  ? "Ready for official filing"
                  : `${completeness.done}/${completeness.total} key details filled`}
              </small>
            </div>
          ) : null}
        </div>
      </section>

      <div className="panel-grid profile-grid">
        <section className="panel">
          <p className="eyebrow">Your details</p>
          <h2>Help us guide your complaint correctly</h2>
          <p className="lede">
            These details make portal filing faster. Fill phone, district, and
            area so redirects and drafts match your location.
          </p>

          {profileLoading ? (
            <p className="lede">Loading your profile…</p>
          ) : profile ? (
            <form className="auth-form profile-form" onSubmit={onSaveProfile}>
              <div className="profile-form-grid">
                <label className="field">
                  <span>Full name *</span>
                  <input
                    value={profile.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="As on Aadhaar / ID"
                    required
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input value={profile.email} readOnly />
                </label>
                <label className="field">
                  <span>Phone *</span>
                  <input
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="10-digit mobile"
                    inputMode="tel"
                  />
                </label>
                <label className="field">
                  <span>Gender (optional)</span>
                  <select
                    value={profile.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="field">
                  <span>District *</span>
                  <select
                    value={profile.district}
                    onChange={(e) => updateField("district", e.target.value)}
                  >
                    {TELANGANA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>PIN code *</span>
                  <input
                    value={profile.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    placeholder="500001"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </label>
                <label className="field profile-field-wide">
                  <span>Area / locality *</span>
                  <input
                    value={profile.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    placeholder="Colony, landmark, village / ward"
                  />
                </label>
                <label className="field">
                  <span>Preferred language</span>
                  <select
                    value={profile.preferredLanguage}
                    onChange={(e) =>
                      updateField("preferredLanguage", e.target.value)
                    }
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </label>
                <label className="field">
                  <span>State</span>
                  <input value="Telangana" readOnly />
                </label>
              </div>

              <div className="guide-box">
                <h3>Why we ask</h3>
                <ul className="guide-list">
                  <li>Phone &amp; name are needed on most official portals</li>
                  <li>District / area helps pick the right GHMC / police path</li>
                  <li>We never invent complaint facts — only guide filing</li>
                </ul>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save profile details"}
              </button>
              {saveMsg ? <p className="success-text">{saveMsg}</p> : null}
              {profileError ? <p className="error-text">{profileError}</p> : null}
            </form>
          ) : (
            <p className="error-text">{profileError || "Profile unavailable."}</p>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">Case history</p>
          <h2>Cases you prepared</h2>
          <p className="lede">
            Drafts, official redirects, and WhatsApp filings linked to this
            account.
          </p>

          <div className="stats-row">
            <div className="stat-box">
              <strong>{stats.total}</strong>
              <span>Total</span>
            </div>
            <div className="stat-box">
              <strong>{stats.drafted}</strong>
              <span>Drafted</span>
            </div>
            <div className="stat-box">
              <strong>{stats.redirected}</strong>
              <span>Redirected</span>
            </div>
            <div className="stat-box">
              <strong>{stats.shared}</strong>
              <span>WhatsApp</span>
            </div>
          </div>

          {historyError ? <p className="error-text">{historyError}</p> : null}
          {historyLoading ? <p className="lede">Loading your cases…</p> : null}
          {!historyLoading && cases.length === 0 && !historyError ? (
            <div className="empty-result">
              <p>No cases yet. Open Speak Up to create your first case.</p>
            </div>
          ) : null}

          <div className="case-list">
            {cases.map((item) => (
              <article key={item.id} className="case-item">
                <div className="case-top">
                  <strong>{item.subject}</strong>
                  <span className={`status-pill status-${item.status}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p>
                  {CASE_DOMAINS[item.caseDomain].title} ·{" "}
                  {ISSUE_LABELS[item.issueType]}
                </p>
                <p className="engine-tag">
                  {item.location} ·{" "}
                  {new Date(item.updatedAt).toLocaleString("en-IN")}
                </p>
                <div className="action-row">
                  {item.portalUrl ? (
                    <a
                      className="btn btn-accent"
                      href={item.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open official portal
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={async () => {
                      await deleteCase(user.id, item.id);
                      const [nextCases, nextStats] = await Promise.all([
                        getCasesForUser(user.id),
                        getCaseStats(user.id),
                      ]);
                      setCases(nextCases);
                      setStats(nextStats);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <AiSettingsPanel compact />
      <FeedbackPanel />
    </div>
  );
}
