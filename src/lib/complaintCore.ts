import { getFilingGuide } from "./filingGuide";
import {
  CASE_DOMAINS,
  ISSUE_LABELS,
  recommendedPortalIds,
} from "./telangana";
import type {
  CaseDomain,
  ComplaintDraft,
  FilingGuidePayload,
  IssueType,
} from "./types";

export function draftComplaintTemplate(input: {
  location: string;
  issueType: IssueType;
  caseDomain: CaseDomain;
  details: string;
  categoryHint?: string;
  officerOrOffice?: string;
}): ComplaintDraft {
  const issueLabel = ISSUE_LABELS[input.issueType] ?? input.issueType;
  const domainMeta = CASE_DOMAINS[input.caseDomain];
  const subject = `Urgent complaint: ${issueLabel} at ${input.location}, Telangana`;

  const bodyByDomain: Record<CaseDomain, string> = {
    waste: `I wish to report a sanitation / clean-city issue in my area.

Issue type: ${issueLabel}
Exact location: ${input.location}, Telangana
Waste category observed: ${input.categoryHint || "Not specified"}
Additional details: ${input.details || "Evidence can be provided."}

This is affecting public hygiene and the environment. Kindly inspect and take necessary action for cleaning, enforcement, and prevention of recurrence.`,

    police_bribery: `I wish to report an alleged bribery / money demand by police personnel.

Issue type: ${issueLabel}
Location / station area: ${input.location}, Telangana
Officer / desk involved: ${input.officerOrOffice || "Not named / unknown"}
Details: ${input.details || "I can provide further facts and evidence."}

I request a lawful enquiry under applicable anti-corruption provisions. I am ready to cooperate with ACB / competent authority.`,

    fir_refusal: `I wish to report refusal / failure to register my complaint / FIR.

Issue type: ${issueLabel}
Police station / area: ${input.location}, Telangana
Officer / desk involved: ${input.officerOrOffice || "Not named / unknown"}
Facts of the original complaint: ${input.details || "Details available with complainant."}

Kindly direct registration of the FIR / complaint as per law, or record reasons in writing.`,

    govt_corruption: `I wish to report alleged corruption / bribe demand by a public servant / government-linked office.

Issue type: ${issueLabel}
Office / location: ${input.location}, Telangana
Person / office involved: ${input.officerOrOffice || "Not named / unknown"}
Details: ${input.details || "I can provide documents and witness information."}

I request enquiry by ACB / Lokayukta / competent authority and protection of the complainant as per law.`,

    women_safety: `I wish to report a women-safety / cyber offence for lawful action and case registration.

Issue type: ${issueLabel}
Location / jurisdiction: ${input.location}, Telangana
Offender / account / office (if known): ${input.officerOrOffice || "Not named / unknown"}
Facts: ${input.details || "I can provide screenshots, links, and chronology."}
Related hint: ${input.categoryHint || "Online / offline harassment"}

This has affected my safety, dignity, and peace of mind. I request:
1) Registration of complaint / FIR through the competent police / cyber cell channel,
2) Enquiry and lawful action against the offender,
3) Assistance for content takedown / protection measures as applicable.

I am ready to cooperate with SHE Teams / Women Safety Wing / Cyber Crime authorities and appear for statement if required.`,

    social_legal: `I wish to bring a social / legal grievance for official action.

Issue type: ${issueLabel}
Location: ${input.location}, Telangana
Office involved: ${input.officerOrOffice || "Not specified"}
Details: ${input.details || "Supporting facts can be shared."}
Related hint: ${input.categoryHint || "N/A"}

Kindly examine the matter and take lawful action / forward to the correct authority.`,

    other: `I wish to register a public grievance for official action.

Issue type: ${issueLabel}
Location: ${input.location}, Telangana
Office / person involved: ${input.officerOrOffice || "Not specified"}
AI-guided situation description: ${input.details || "Details available with complainant."}
Category hint: ${input.categoryHint || "Custom / other"}

Kindly examine the matter, forward to the competent authority if needed, and take lawful action.`,
  };

  const body = `To
The Concerned Authority
${domainMeta.authority}
Telangana

Subject: ${subject}

Respected Sir/Madam,

${bodyByDomain[input.caseDomain]}

Declaration: The statements above are made in good faith for lawful redress. I request action through official portals and am ready to appear if required.

Thank you.

Yours sincerely,
A concerned citizen of Telangana
Date: ${new Date().toLocaleDateString("en-IN")}`;

  return {
    subject,
    body,
    issueType: input.issueType,
    caseDomain: input.caseDomain,
    location: input.location,
    engine: "template",
    recommendedPortalIds: recommendedPortalIds(input.caseDomain),
    filingGuide: buildStaticFilingGuide(input.caseDomain),
  };
}

export function buildStaticFilingGuide(domain: CaseDomain): FilingGuidePayload {
  const guide = getFilingGuide(domain);
  return {
    summary: `Use ${guide.portalName}. Copy the Praja Rakshak draft, fill each form field with facts only, attach proof if available, then submit and save the acknowledgement number.`,
    checklist: guide.beforeYouStart,
    portalSteps: guide.pasteInstructions,
    formFillTips: guide.formFields.map((field) => ({
      field: field.label,
      tip: `${field.whatToWrite} Example: ${field.example}`,
    })),
  };
}

export function normalizeFilingGuide(
  value: unknown,
  domain: CaseDomain,
): FilingGuidePayload {
  const fallback = buildStaticFilingGuide(domain);
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;

  const formFillTips = Array.isArray(raw.formFillTips)
    ? raw.formFillTips
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const field = String(row.field ?? "").trim();
          const tip = String(row.tip ?? "").trim();
          if (!field || !tip) return null;
          return { field, tip };
        })
        .filter((item): item is { field: string; tip: string } => Boolean(item))
    : [];

  return {
    summary: String(raw.summary ?? fallback.summary),
    checklist: asStringArray(raw.checklist, fallback.checklist),
    portalSteps: asStringArray(raw.portalSteps, fallback.portalSteps),
    formFillTips: formFillTips.length ? formFillTips.slice(0, 6) : fallback.formFillTips,
  };
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map(String).filter(Boolean);
  return items.length ? items.slice(0, 6) : fallback;
}
