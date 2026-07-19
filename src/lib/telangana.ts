import type { CaseDomain, IssueType } from "./types";

export type Portal = {
  id: string;
  name: string;
  description: string;
  url: string;
  domains: CaseDomain[];
};

export const TELANGANA_PORTALS: Portal[] = [
  {
    id: "ghmc-igs",
    name: "GHMC Integrated Grievance System",
    description: "Sanitation, garbage, roads, and municipal civic complaints in Hyderabad.",
    url: "https://igs.ghmc.gov.in/operator/send_otp_mobile",
    domains: ["waste", "other"],
  },
  {
    id: "ghmc-home",
    name: "GHMC Official Portal",
    description: "Greater Hyderabad Municipal Corporation citizen services.",
    url: "https://www.ghmc.gov.in/",
    domains: ["waste", "other"],
  },
  {
    id: "tspcb",
    name: "Telangana State Pollution Control Board",
    description: "Pollution, burning waste, and environmental hazards.",
    url: "https://tspcb.cgg.gov.in/",
    domains: ["waste", "other"],
  },
  {
    id: "acb",
    name: "Anti Corruption Bureau (ACB) Telangana",
    description: "Report bribery and corruption by public servants. Toll-free: 1064.",
    url: "https://acb.telangana.gov.in/",
    domains: ["police_bribery", "govt_corruption", "social_legal", "other"],
  },
  {
    id: "lokayukta",
    name: "Institution of Lokayukta, Telangana",
    description: "Complaints on maladministration, misuse of power by public servants.",
    url: "https://lokayukta.telangana.gov.in/",
    domains: ["govt_corruption", "social_legal", "fir_refusal", "other"],
  },
  {
    id: "ts-police",
    name: "Telangana State Police",
    description: "Police department portal for citizen information and contacts.",
    url: "https://www.tspolice.gov.in/",
    domains: [
      "police_bribery",
      "fir_refusal",
      "social_legal",
      "women_safety",
      "other",
    ],
  },
  {
    id: "cybercrime",
    name: "National Cyber Crime Reporting Portal",
    description:
      "Official Government of India portal to report online / social media crimes against women and other cyber offences. Can lead to police case registration.",
    url: "https://www.cybercrime.gov.in/",
    domains: ["women_safety", "other"],
  },
  {
    id: "women-safety-wing",
    name: "Telangana Police Women Safety Wing / SHE Teams",
    description:
      "Official Telangana Women Safety Wing & SHE Teams for street, phone, and online harassment against women.",
    url: "https://womensafetywing.telangana.gov.in/",
    domains: ["women_safety", "other"],
  },
  {
    id: "she-box",
    name: "SHe-Box (Sexual Harassment at Workplace)",
    description:
      "Official Government of India portal to file workplace sexual harassment complaints.",
    url: "https://shebox.wcd.gov.in/",
    domains: ["women_safety", "other"],
  },
  {
    id: "ncw",
    name: "National Commission for Women (NCW)",
    description:
      "National Commission for Women online complaint registration for women’s rights and safety grievances.",
    url: "https://ncwapps.nic.in/onlinecomplaintsv2/",
    domains: ["women_safety", "social_legal", "other"],
  },
  {
    id: "cpgrams",
    name: "CPGRAMS (Central Grievance Portal)",
    description: "Escalate grievances through the national public grievance system.",
    url: "https://pgportal.gov.in/",
    domains: [
      "waste",
      "police_bribery",
      "fir_refusal",
      "govt_corruption",
      "social_legal",
      "women_safety",
      "other",
    ],
  },
  {
    id: "telangana-gov",
    name: "Government of Telangana",
    description: "State portal for departments and citizen services.",
    url: "https://www.telangana.gov.in/",
    domains: ["waste", "govt_corruption", "social_legal", "women_safety", "other"],
  },
];

export const HELPLINES = [
  {
    id: "acb-phone",
    label: "ACB Toll-Free",
    value: "1064",
    href: "tel:1064",
    note: "Report bribery / corruption demands in Telangana.",
    domains: ["police_bribery", "govt_corruption", "other"] as CaseDomain[],
  },
  {
    id: "ghmc-wa",
    label: "Official GHMC WhatsApp",
    value: "8125966586",
    href: "https://wa.me/918125966586",
    note: "Official GHMC WhatsApp for waste / sanitation grievances.",
    domains: ["waste"] as CaseDomain[],
  },
  {
    id: "women-helpline",
    label: "Women Helpline",
    value: "181",
    href: "tel:181",
    note: "National / state women helpline for immediate safety support.",
    domains: ["women_safety"] as CaseDomain[],
  },
  {
    id: "emergency-112",
    label: "Emergency Police",
    value: "112",
    href: "tel:112",
    note: "Use for immediate danger. Ask for police help right away.",
    domains: ["women_safety", "fir_refusal"] as CaseDomain[],
  },
  {
    id: "she-teams-wa",
    label: "SHE Teams WhatsApp",
    value: "8712656856",
    href: "https://wa.me/918712656856",
    note: "Official Telangana SHE Teams WhatsApp for harassment complaints.",
    domains: ["women_safety"] as CaseDomain[],
  },
];

export const CASE_DOMAINS: Record<
  CaseDomain,
  {
    title: string;
    subtitle: string;
    issues: IssueType[];
    authority: string;
  }
> = {
  waste: {
    title: "Waste & Clean City",
    subtitle: "Dumping, bins, pollution, segregation failures",
    issues: [
      "illegal_dumping",
      "overflowing_bin",
      "mixed_waste",
      "burning_waste",
    ],
    authority: "GHMC / Municipal body / TSPCB",
  },
  police_bribery: {
    title: "Police Bribery",
    subtitle: "Officer asking money / bribe for duty",
    issues: ["police_bribe_demand", "police_harassment"],
    authority: "ACB Telangana / senior police / CPGRAMS",
  },
  fir_refusal: {
    title: "FIR Not Being Filed",
    subtitle: "Police refusing to register complaint / FIR",
    issues: ["fir_not_registered"],
    authority: "SP / DGP channel / Lokayukta / CPGRAMS",
  },
  govt_corruption: {
    title: "Govt Corruption",
    subtitle: "Official or public representative demanding bribe",
    issues: [
      "official_bribe",
      "corrupt_public_servant",
      "service_denied_for_bribe",
    ],
    authority: "ACB / Lokayukta Telangana",
  },
  women_safety: {
    title: "Women Safety",
    subtitle: "Online / social media harassment, stalking, cyber blackmail, SHE Teams",
    issues: [
      "online_social_media_harassment",
      "cyber_blackmail_threat",
      "stalking_eve_teasing",
      "workplace_sexual_harassment",
      "domestic_violence_safety",
    ],
    authority:
      "National Cyber Crime Portal / Telangana SHE Teams / Women Safety Wing / NCW",
  },
  social_legal: {
    title: "Social & Legal Case",
    subtitle: "Welfare denial, document fraud, other legal grievance",
    issues: ["women_child_welfare", "land_document_fraud", "other_social"],
    authority: "Concerned department / Lokayukta / CPGRAMS",
  },
  other: {
    title: "Other",
    subtitle: "Describe your situation — AI will guide description & redirects",
    issues: ["other_custom"],
    authority:
      "AI-matched authority (Cyber Crime / SHE Teams / ACB / Police / GHMC / Lokayukta)",
  },
};

export const ISSUE_LABELS: Record<IssueType, string> = {
  illegal_dumping: "Illegal dumping of garbage",
  overflowing_bin: "Overflowing / uncollected bin",
  mixed_waste: "Mixed waste left in public area",
  burning_waste: "Open burning of waste",
  police_bribe_demand: "Police officer demanding bribe / money",
  fir_not_registered: "Police refusing to file FIR / complaint",
  police_harassment: "Police harassment linked to bribe pressure",
  official_bribe: "Government official demanding bribe",
  corrupt_public_servant: "Corrupt act by public servant / office staff",
  service_denied_for_bribe: "Public service denied unless bribe is paid",
  online_social_media_harassment:
    "Online / social media harassment or abuse",
  cyber_blackmail_threat: "Cyber blackmail / morphing / threat messages",
  stalking_eve_teasing: "Stalking / eve-teasing / public harassment",
  workplace_sexual_harassment: "Sexual harassment at workplace",
  domestic_violence_safety: "Domestic violence / home safety threat",
  women_child_welfare: "Women / child welfare related grievance",
  land_document_fraud: "Land / document related fraud or abuse",
  other_social: "Other social or legal grievance",
  other_custom: "Custom situation (AI guided)",
};

export function portalsForDomain(domain: CaseDomain): Portal[] {
  const matched = TELANGANA_PORTALS.filter((p) => p.domains.includes(domain));
  return matched.length ? matched : TELANGANA_PORTALS;
}

export function recommendedPortalIds(domain: CaseDomain): string[] {
  const order: Record<CaseDomain, string[]> = {
    waste: ["ghmc-igs", "tspcb", "cpgrams"],
    police_bribery: ["acb", "ts-police", "cpgrams"],
    fir_refusal: ["ts-police", "lokayukta", "cpgrams"],
    govt_corruption: ["acb", "lokayukta", "cpgrams"],
    women_safety: [
      "cybercrime",
      "women-safety-wing",
      "she-box",
      "ncw",
      "ts-police",
    ],
    social_legal: ["lokayukta", "cpgrams", "telangana-gov", "ncw"],
    other: [
      "cybercrime",
      "women-safety-wing",
      "cpgrams",
      "lokayukta",
      "acb",
      "telangana-gov",
      "ts-police",
    ],
  };
  return order[domain];
}
