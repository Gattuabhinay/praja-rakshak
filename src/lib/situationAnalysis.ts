import { CASE_DOMAINS, recommendedPortalIds, TELANGANA_PORTALS } from "./telangana";
import type { CaseDomain, SituationAnalysis } from "./types";

const DOMAIN_KEYS: CaseDomain[] = [
  "waste",
  "police_bribery",
  "fir_refusal",
  "govt_corruption",
  "women_safety",
  "social_legal",
  "other",
];

export function normalizeMatchedDomain(value: unknown): CaseDomain {
  const key = String(value ?? "").trim().toLowerCase();
  if ((DOMAIN_KEYS as string[]).includes(key) && key !== "other") {
    return key as CaseDomain;
  }
  return "social_legal";
}

export function analyzeSituationTemplate(situation: string): SituationAnalysis {
  const text = situation.toLowerCase();
  let matchedDomain: CaseDomain = "social_legal";

  if (
    /harass|stalk|eve.?teas|cyber|blackmail|morph|nude.?threat|instagram|facebook|whatsapp.*abus|social media|women.?safety|she.?team|molest|dowry|domestic violence|sexual harassment/.test(
      text,
    )
  ) {
    matchedDomain = "women_safety";
  } else if (
    /garbage|waste|dump|bin|segregat|pollution|sanitation|ghmc|drain|sewage|burning/.test(
      text,
    )
  ) {
    matchedDomain = "waste";
  } else if (
    /fir|complaint not (being )?filed|refus(e|ing) to (register|file)|police station.*(not|no).*fir/.test(
      text,
    )
  ) {
    matchedDomain = "fir_refusal";
  } else if (
    /(police).{0,40}(bribe|money|hafta|extort)|(bribe|money|hafta).{0,40}(police|constable|si\b|inspector)/.test(
      text,
    )
  ) {
    matchedDomain = "police_bribery";
  } else if (
    /bribe|corrupt|acb|lokayukta|official.*(money|bribe)|public servant|demanding money/.test(
      text,
    )
  ) {
    matchedDomain = "govt_corruption";
  }

  const meta = CASE_DOMAINS[matchedDomain];
  const portalIds = recommendedPortalIds(matchedDomain);
  const portalNames = portalIds
    .map((id) => TELANGANA_PORTALS.find((p) => p.id === id)?.name)
    .filter(Boolean);

  const cleaned = situation.trim().replace(/\s+/g, " ");
  const description =
    matchedDomain === "women_safety"
      ? `I wish to report a women-safety / cyber offence in Telangana for official action and case registration.

Situation: ${cleaned}

I request registration of complaint / FIR through the National Cyber Crime Reporting Portal and/or Telangana SHE Teams / Women Safety Wing, enquiry against the offender, and protection measures as per law. Screenshots and chronology can be provided.`
      : `I wish to register the following grievance in Telangana for official action.

Situation: ${cleaned}

Location context: Please use the area/office mentioned above (or Hyderabad / Telangana if not stated).
Impact: This affects lawful public service / civic duty and requires competent authority intervention.
Relief sought: Kindly enquire, take lawful corrective action, and inform the complainant of the outcome.

I am ready to cooperate and provide further evidence if required.`;

  return {
    matchedDomain,
    title: meta.title,
    description,
    locationHint: "Hyderabad, Telangana",
    recommendedPortalIds: portalIds,
    nextSteps:
      matchedDomain === "women_safety"
        ? [
            "If in danger now: call 112 or Women Helpline 181",
            `Open ${portalNames[0] || "National Cyber Crime Portal"} and file online`,
            "Also message official SHE Teams WhatsApp 8712656856 with facts + screenshots",
            "Save acknowledgement / complaint ID",
            "If workplace harassment: also file on SHe-Box",
          ]
        : [
            `Open ${portalNames[0] || "the recommended portal"} first`,
            "Paste the AI description into the official complaint form",
            "Attach photos / proof if the portal allows",
            "Save the acknowledgement number after submit",
            portalNames[1]
              ? `If unresolved, escalate via ${portalNames[1]}`
              : "If unresolved, escalate via CPGRAMS",
          ],
    authority: meta.authority,
    engine: "template",
  };
}
