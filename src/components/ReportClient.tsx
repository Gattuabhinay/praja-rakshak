"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AiKeyBadge } from "@/components/AiKeyBadge";
import { useAuth } from "@/components/AuthProvider";
import { JourneyStrip } from "@/components/JourneyStrip";
import { OfficialRedirectCard } from "@/components/OfficialRedirectCard";
import { getAiSettings } from "@/lib/aiSettings";
import { isDemoUser } from "@/lib/auth";
import { markCaseRedirected, saveCase } from "@/lib/cases";
import { getFilingGuide } from "@/lib/filingGuide";
import { loadClassification } from "@/lib/session";
import {
  CASE_DOMAINS,
  HELPLINES,
  ISSUE_LABELS,
  portalsForDomain,
  recommendedPortalIds,
  TELANGANA_PORTALS,
} from "@/lib/telangana";
import type {
  CaseDomain,
  ComplaintDraft,
  IssueType,
  SituationAnalysis,
} from "@/lib/types";
import {
  buildOfficialWhatsAppUrl,
  buildWhatsAppShareUrl,
  officialWhatsAppButtonLabel,
  officialWhatsAppForDomain,
  whatsappChannelsFor,
} from "@/lib/whatsapp";

const DOMAIN_ORDER: CaseDomain[] = [
  "waste",
  "police_bribery",
  "fir_refusal",
  "govt_corruption",
  "women_safety",
  "social_legal",
  "other",
];

type Step = 1 | 2 | 3 | 4;

export function ReportClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [caseDomain, setCaseDomain] = useState<CaseDomain>("waste");
  const [location, setLocation] = useState("Hyderabad, Telangana");
  const [issueType, setIssueType] = useState<IssueType>("illegal_dumping");
  const [details, setDetails] = useState("");
  const [categoryHint, setCategoryHint] = useState("");
  const [officerOrOffice, setOfficerOrOffice] = useState("");
  const [whenHappened, setWhenHappened] = useState("");
  const [draft, setDraft] = useState<ComplaintDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [situation, setSituation] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SituationAnalysis | null>(null);

  const staticGuide = useMemo(() => getFilingGuide(caseDomain), [caseDomain]);
  const guideDomain = analysis?.matchedDomain ?? caseDomain;
  const redirectGuide = useMemo(
    () => getFilingGuide(guideDomain),
    [guideDomain],
  );

  useEffect(() => {
    const saved = loadClassification();
    if (saved) {
      setCaseDomain("waste");
      setIssueType("illegal_dumping");
      setCategoryHint(saved.label);
      setDetails(
        `AI classified nearby waste as ${saved.label} (${Math.round(saved.confidence * 100)}% confidence). ${saved.summary}`,
      );
    }
  }, []);

  useEffect(() => {
    const firstIssue = CASE_DOMAINS[caseDomain].issues[0];
    setIssueType(firstIssue);
    setDraft(null);
    setCopied(false);
    setSavedMsg(null);
    if (caseDomain !== "other") {
      setAnalysis(null);
    }
  }, [caseDomain]);

  const fullText = useMemo(() => {
    if (!draft) return "";
    return `${draft.subject}\n\n${draft.body}`;
  }, [draft]);

  const topPortalIds =
    analysis?.recommendedPortalIds ?? recommendedPortalIds(guideDomain);
  const portals = useMemo(() => {
    if (analysis?.recommendedPortalIds?.length) {
      const ordered = analysis.recommendedPortalIds
        .map((id) => TELANGANA_PORTALS.find((p) => p.id === id))
        .filter((p): p is (typeof TELANGANA_PORTALS)[number] => Boolean(p));
      const extras = portalsForDomain(guideDomain).filter(
        (p) => !ordered.some((o) => o.id === p.id),
      );
      return [...ordered, ...extras];
    }
    return portalsForDomain(guideDomain);
  }, [analysis, guideDomain]);
  const primaryPortal =
    portals.find((p) => p.id === topPortalIds[0]) ?? portals[0];
  const helplines = HELPLINES.filter(
    (h) =>
      h.domains.includes(guideDomain) || h.domains.includes(caseDomain),
  );
  const waChannels = whatsappChannelsFor(guideDomain);
  const officialWa = officialWhatsAppForDomain(guideDomain);
  const showOfficerField = caseDomain !== "waste";
  const showWasteHint = caseDomain === "waste";
  const showWomenSafetyHint = caseDomain === "women_safety";

  async function analyzeOtherSituation() {
    if (situation.trim().length < 20) {
      setError("Describe your situation in a few sentences (min 20 characters).");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    try {
      const settings = getAiSettings();
      const response = await fetch("/api/analyze-situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          provider: settings.provider,
          apiKey: settings.apiKey,
        }),
      });
      const data = (await response.json()) as SituationAnalysis & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Could not analyze situation");
      }
      setAnalysis(data);
      setDetails(data.description);
      setCategoryHint(data.title);
      if (data.locationHint) setLocation(data.locationHint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function continueFromStep1() {
    if (caseDomain === "other") {
      if (!analysis) {
        setError("Enter your situation and run AI analysis before continuing.");
        return;
      }
      setDetails(analysis.description);
      setCategoryHint(analysis.title);
      if (analysis.locationHint) setLocation(analysis.locationHint);
    }
    setError(null);
    setStep(2);
  }

  async function generate() {
    if (!location.trim() || !details.trim()) {
      setError("Please fill location and what happened before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSavedMsg(null);

    const enrichedDetails = [
      whenHappened ? `When: ${whenHappened}` : "",
      details,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const settings = getAiSettings();
      const response = await fetch("/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          issueType,
          caseDomain,
          details: enrichedDetails,
          categoryHint,
          officerOrOffice,
          provider: settings.provider,
          apiKey: settings.apiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Draft failed");
      const nextDraft = {
        ...(data as ComplaintDraft),
        recommendedPortalIds:
          analysis?.recommendedPortalIds ??
          (data as ComplaintDraft).recommendedPortalIds,
      };
      setDraft(nextDraft);
      if (user && !isDemoUser(user)) {
        try {
          const saved = await saveCase({
            userId: user.id,
            caseDomain: nextDraft.caseDomain,
            issueType: nextDraft.issueType,
            location: nextDraft.location,
            subject: nextDraft.subject,
            body: nextDraft.body,
            portalUrl: primaryPortal?.url,
            portalName: primaryPortal?.name,
          });
          setActiveCaseId(saved.id);
          setSavedMsg("Saved to your Supabase case history.");
        } catch {
          setActiveCaseId(null);
          setSavedMsg("Draft ready. History save skipped for now.");
        }
      } else if (user && isDemoUser(user)) {
        setActiveCaseId(null);
        setSavedMsg("Demo mode: draft ready. Create a real account to keep history.");
      } else {
        setActiveCaseId(null);
        setSavedMsg("Login to keep this case in your history.");
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft complaint");
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    if (!fullText) return;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
  }

  async function saveDraftToDashboard() {
    if (!draft) return;
    if (!user) {
      setSavedMsg("Login first to save this draft to your history.");
      return;
    }
    try {
      const saved = await saveCase({
        userId: user.id,
        caseDomain: draft.caseDomain,
        issueType: draft.issueType,
        location: draft.location,
        subject: draft.subject,
        body: draft.body,
        portalUrl: primaryPortal?.url,
        portalName: primaryPortal?.name,
      });
      setActiveCaseId(saved.id);
      setSavedMsg("Saved to case history. Continue to official redirect.");
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Could not save case");
    }
  }

  function trackOfficialRedirect(
    targetName: string,
    kind: "redirected" | "shared_whatsapp" = "redirected",
    targetUrl?: string,
  ) {
    if (!user || !activeCaseId) return;
    void markCaseRedirected(
      user.id,
      activeCaseId,
      targetName,
      kind,
      targetUrl,
      kind === "shared_whatsapp" ? "whatsapp-official" : "government-portal",
    );
  }

  return (
    <div className="speak-wrap">
      <section className="panel speak-hero">
        <p className="eyebrow">Step 2 · Speak Up</p>
        <h1>Draft complaint → get filing guide → official redirect</h1>
        <JourneyStrip active="speakup" authed />
        <AiKeyBadge />

        <div className="stepper">
          {[
            { n: 1 as Step, label: "Choose case" },
            { n: 2 as Step, label: "Fill facts" },
            { n: 3 as Step, label: "AI draft" },
            { n: 4 as Step, label: "File on portal" },
          ].map((item) => (
            <button
              key={item.n}
              type="button"
              className={`stepper-item ${step === item.n ? "active" : ""} ${step > item.n ? "done" : ""}`}
              onClick={() => {
                if (item.n === 3 && !draft) return;
                if (item.n === 4 && !draft) return;
                setStep(item.n);
              }}
            >
              <span>{item.n}</span>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {step === 1 ? (
        <section className="panel animate-in">
          <p className="eyebrow">Step 1</p>
          <h2>What do you want to complain about?</h2>
          <p className="lede">
            Pick one case type. AI will guide the complaint format for that
            official channel.
          </p>
          <div className="domain-grid">
            {DOMAIN_ORDER.map((domain) => {
              const meta = CASE_DOMAINS[domain];
              const active = domain === caseDomain;
              return (
                <button
                  key={domain}
                  type="button"
                  className={`domain-chip ${active ? "active" : ""}`}
                  onClick={() => {
                    setCaseDomain(domain);
                    setError(null);
                    if (domain !== "other") setAnalysis(null);
                  }}
                >
                  <strong>{meta.title}</strong>
                  <span>{meta.subtitle}</span>
                </button>
              );
            })}
          </div>

          {caseDomain === "other" ? (
            <div className="guide-box">
              <h3>Describe your situation</h3>
              <p className="lede" style={{ marginBottom: "0.75rem" }}>
                Write what happened in plain language. AI will build a formal
                description, match the right authority, and show official
                redirects for your case.
              </p>
              <label className="field">
                <span>Your situation *</span>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  rows={6}
                  placeholder="Example: My ration card application is stuck for 3 months at the local office and staff keep asking for money to move the file…"
                />
              </label>
              <div className="action-row">
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={analyzeOtherSituation}
                  disabled={analyzing}
                >
                  {analyzing
                    ? "AI is analyzing…"
                    : "Analyze with AI → description & redirects"}
                </button>
                <AiKeyBadge />
              </div>
              {error ? <p className="error-text">{error}</p> : null}

              {analysis ? (
                <div className="other-ai-result" style={{ marginTop: "1rem" }}>
                  <h3>AI guidance for your case</h3>
                  <p>
                    Matched case: <strong>{analysis.title}</strong>
                  </p>
                  <p className="engine-tag">
                    Authority: {analysis.authority} · Engine: {analysis.engine}
                  </p>
                  <h4>Perfect description (ready for portals)</h4>
                  <pre className="complaint-box">{analysis.description}</pre>
                  <h4>What you should do next</h4>
                  <ol className="guide-list">
                    {analysis.nextSteps.map((stepItem) => (
                      <li key={stepItem}>{stepItem}</li>
                    ))}
                  </ol>
                  <h4>Official redirects for this case</h4>
                  <div className="official-grid">
                    {portals.slice(0, 4).map((portal) => (
                      <OfficialRedirectCard
                        key={portal.id}
                        name={portal.name}
                        description={portal.description}
                        url={portal.url}
                        recommended={topPortalIds.includes(portal.id)}
                        channelType="government-portal"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="guide-box">
              <h3>AI format preview for this case</h3>
              <p>
                You will file on: <strong>{staticGuide.portalName}</strong>
              </p>
              <p className="engine-tag">
                Authority: {CASE_DOMAINS[caseDomain].authority}
              </p>
              <ol className="guide-list">
                {staticGuide.beforeYouStart.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={continueFromStep1}
            disabled={caseDomain === "other" && !analysis}
          >
            {caseDomain === "other"
              ? analysis
                ? "Use AI description & continue →"
                : "Analyze situation first"
              : "Continue to guided fact form →"}
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <div className="panel-grid animate-in">
          <section className="panel">
            <p className="eyebrow">Step 2 · Guided facts</p>
            <h2>Fill the complaint facts (AI-ready format)</h2>
            <p className="lede">
              Write clear facts. AI will convert this into a formal complaint and
              portal fill guide.
            </p>

            <label className="field">
              <span>Issue type</span>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
              >
                {CASE_DOMAINS[caseDomain].issues.map((value) => (
                  <option key={value} value={value}>
                    {ISSUE_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Location in Telangana *</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Area / station / office + landmark"
              />
              <small className="field-tip">
                Format tip: Area + landmark + district/city. Example: Near Charminar, Hyderabad.
              </small>
            </label>

            <label className="field">
              <span>When did it happen?</span>
              <input
                value={whenHappened}
                onChange={(e) => setWhenHappened(e.target.value)}
                placeholder="Date / time / how long ongoing"
              />
              <small className="field-tip">
                Format tip: Include date and approximate time if known.
              </small>
            </label>

            {showOfficerField ? (
              <label className="field">
                <span>
                  {showWomenSafetyHint
                    ? "Offender / account / handle (if known)"
                    : "Officer / office involved"}
                </span>
                <input
                  value={officerOrOffice}
                  onChange={(e) => setOfficerOrOffice(e.target.value)}
                  placeholder={
                    showWomenSafetyHint
                      ? "Instagram/Facebook handle, phone number, or person name"
                      : "Station, desk, department, or designation"
                  }
                />
                <small className="field-tip">
                  {showWomenSafetyHint
                    ? "Format tip: platform + username/link. If unknown, write “unknown offender”."
                    : "Format tip: If name unknown, write designation + place."}
                </small>
              </label>
            ) : null}

            {showWasteHint ? (
              <label className="field">
                <span>Waste category (optional)</span>
                <input
                  value={categoryHint}
                  onChange={(e) => setCategoryHint(e.target.value)}
                  placeholder="Wet / Dry / Hazardous / E-waste"
                />
              </label>
            ) : null}

            {showWomenSafetyHint ? (
              <div className="guide-box">
                <h3>How to register a legal / police case (women safety)</h3>
                <ol className="guide-list">
                  <li>
                    Immediate danger → call <strong>112</strong> or Women Helpline{" "}
                    <strong>181</strong>
                  </li>
                  <li>
                    Online / social media abuse → file on{" "}
                    <strong>cybercrime.gov.in</strong> (can lead to police case)
                  </li>
                  <li>
                    Also report to Telangana <strong>SHE Teams</strong> (WhatsApp
                    8712656856 / Women Safety Wing site)
                  </li>
                  <li>
                    Workplace sexual harassment → file on{" "}
                    <strong>SHe-Box</strong>
                  </li>
                  <li>
                    Keep screenshots + dates; save every acknowledgement number
                  </li>
                </ol>
              </div>
            ) : null}

            <label className="field">
              <span>What happened (facts only) *</span>
              <textarea
                rows={6}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Write in this order: 1) what happened 2) who was involved 3) what was asked/refused 4) impact on you"
              />
              <small className="field-tip">
                Best format: What → Who → When → Where → Impact → What you want done.
              </small>
            </label>

            <p className="legal-note">
              Good-faith facts only. False complaints can have legal consequences.
              AI prepares the draft; government portals file the real case.
            </p>

            <div className="action-row">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={generate}
                disabled={loading}
              >
                {loading ? "AI is drafting + building filing guide…" : "Generate AI draft + filing guide"}
              </button>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <section className="panel">
            <p className="eyebrow">How official forms are usually filled</p>
            <h2>Field-by-field format</h2>
            <div className="form-tip-list">
              {staticGuide.formFields.map((field) => (
                <article key={field.label} className="form-tip-item">
                  <strong>{field.label}</strong>
                  <p>{field.whatToWrite}</p>
                  <span>Example: {field.example}</span>
                </article>
              ))}
            </div>
            <div className="guide-box warn">
              <h3>Do not</h3>
              <ul className="guide-list">
                {staticGuide.dontDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      ) : null}

      {step === 3 && draft ? (
        <div className="panel-grid animate-in">
          <section className="panel">
            <p className="eyebrow">Step 3 · AI complaint draft</p>
            <h2>{draft.subject}</h2>
            <pre className="complaint-box">{draft.body}</pre>
            <p className="engine-tag">
              Engine:{" "}
              {draft.engine === "gemini"
                ? "Gemini (your key)"
                : draft.engine === "openrouter"
                  ? "OpenRouter (your key)"
                  : draft.engine === "openai"
                    ? "OpenAI ChatGPT (your key)"
                    : draft.engine === "claude"
                      ? "Claude (your key)"
                      : "Smart template + guide (add key in AI Settings)"}
            </p>
            <div className="action-row">
              <button type="button" className="btn btn-primary" onClick={copyDraft}>
                {copied ? "Copied" : "Copy full complaint"}
              </button>
              {officialWa ? (
                <a
                  className="btn btn-accent"
                  href={buildOfficialWhatsAppUrl(officialWa, fullText)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackOfficialRedirect(
                      officialWa.label,
                      "shared_whatsapp",
                      buildOfficialWhatsAppUrl(officialWa, fullText),
                    )
                  }
                >
                  {officialWhatsAppButtonLabel(officialWa)}
                </a>
              ) : (
                <a
                  className="btn btn-ghost"
                  href={buildWhatsAppShareUrl(fullText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share draft on WhatsApp
                </a>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={saveDraftToDashboard}
              >
                Save to dashboard
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => setStep(4)}
              >
                Next: How to file on portal →
              </button>
            </div>
            {officialWa ? (
              <p className="engine-tag">
                Official {officialWa.authority} WhatsApp: {officialWa.number} —
                complaint text is prefilled for the government channel.
              </p>
            ) : null}
            {savedMsg ? <p className="engine-tag">{savedMsg}</p> : null}
            {!user ? (
              <p className="legal-note">
                <Link href="/login">Login</Link> to keep this case in your history.
              </p>
            ) : null}
          </section>

          <section className="panel">
            <p className="eyebrow">AI filing coach</p>
            <h2>How to fill this complaint</h2>
            <p className="lede">{draft.filingGuide.summary}</p>

            <h3>Checklist before opening portal</h3>
            <ul className="guide-list">
              {draft.filingGuide.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3>Form fill tips (AI)</h3>
            <div className="form-tip-list">
              {draft.filingGuide.formFillTips.map((tip) => (
                <article key={`${tip.field}-${tip.tip}`} className="form-tip-item">
                  <strong>{tip.field}</strong>
                  <p>{tip.tip}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {step === 4 && draft ? (
        <div className="panel-grid animate-in">
          <section className="panel">
            <p className="eyebrow">Step 4 · Official redirect zone</p>
            <h2>These are external government official channels</h2>
            <div className="redirect-banner">
              <strong>OFFICIAL REDIRECT NOTICE</strong>
              <p>
                Praja Rakshak only prepares your complaint. When you click below, you
                leave this web app and open a real Telangana / national government
                official site or official WhatsApp channel to file the case.
              </p>
            </div>

            <ol className="portal-steps">
              {draft.filingGuide.portalSteps.map((item, index) => (
                <li key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>

            <div className="action-row">
              <button type="button" className="btn btn-ghost" onClick={copyDraft}>
                {copied ? "Copied" : "Copy complaint again"}
              </button>
              {officialWa ? (
                <a
                  className="btn btn-primary"
                  href={buildOfficialWhatsAppUrl(officialWa, fullText)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackOfficialRedirect(
                      officialWa.label,
                      "shared_whatsapp",
                      buildOfficialWhatsAppUrl(officialWa, fullText),
                    )
                  }
                >
                  {officialWhatsAppButtonLabel(officialWa)}
                </a>
              ) : (
                <a
                  className="btn btn-ghost"
                  href={buildWhatsAppShareUrl(fullText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share draft on WhatsApp
                </a>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push("/dashboard?section=portals")}
              >
                All official portals
              </button>
            </div>
            {officialWa ? (
              <div className="guide-box">
                <h3>Official government WhatsApp for this case</h3>
                <p>
                  <strong>{officialWa.label}</strong> · {officialWa.number}
                </p>
                <p>{officialWa.note}</p>
                <p className="engine-tag">
                  Waste → GHMC WhatsApp. Bribery / corruption → ACB WhatsApp.
                  Women safety → SHE Teams WhatsApp.
                </p>
              </div>
            ) : null}

            <div className="guide-box">
              <h3>After you submit on the official site</h3>
              <ul className="guide-list">
                {redirectGuide.afterSubmit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {!user ? (
              <p className="legal-note">
                <Link href="/login">Login</Link> so each official redirect is
                counted in your case history.
              </p>
            ) : null}
          </section>

          <section className="panel">
            <p className="eyebrow">Visible official redirects</p>
            <h2>Open government official sites</h2>
            <div className="official-grid">
              {portals.map((portal) => (
                <OfficialRedirectCard
                  key={portal.id}
                  name={portal.name}
                  description={portal.description}
                  url={portal.url}
                  recommended={topPortalIds.includes(portal.id)}
                  channelType="government-portal"
                  onOpen={() => trackOfficialRedirect(portal.name, "redirected", portal.url)}
                />
              ))}
              {waChannels.map((channel) => (
                <OfficialRedirectCard
                  key={channel.id}
                  name={channel.label}
                  description={`${channel.note} Number: ${channel.number}`}
                  url={buildOfficialWhatsAppUrl(channel, fullText)}
                  recommended
                  channelType="whatsapp-official"
                  onOpen={() =>
                    trackOfficialRedirect(
                      channel.label,
                      "shared_whatsapp",
                      buildOfficialWhatsAppUrl(channel, fullText),
                    )
                  }
                />
              ))}
              {helplines.map((line) => (
                <OfficialRedirectCard
                  key={line.id}
                  name={`${line.label}: ${line.value}`}
                  description={line.note}
                  url={line.href}
                  channelType="helpline"
                  onOpen={() =>
                    trackOfficialRedirect(line.label, "redirected", line.href)
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep(2)}
              style={{ marginTop: "1rem" }}
            >
              Edit facts and regenerate
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
