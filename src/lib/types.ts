export type WasteCategory = "wet" | "dry" | "hazardous" | "ewaste" | "mixed";

export type CaseDomain =
  | "waste"
  | "police_bribery"
  | "fir_refusal"
  | "govt_corruption"
  | "women_safety"
  | "social_legal"
  | "other";

export type IssueType =
  | "illegal_dumping"
  | "overflowing_bin"
  | "mixed_waste"
  | "burning_waste"
  | "police_bribe_demand"
  | "fir_not_registered"
  | "police_harassment"
  | "official_bribe"
  | "corrupt_public_servant"
  | "service_denied_for_bribe"
  | "online_social_media_harassment"
  | "cyber_blackmail_threat"
  | "stalking_eve_teasing"
  | "workplace_sexual_harassment"
  | "domestic_violence_safety"
  | "women_child_welfare"
  | "land_document_fraud"
  | "other_social"
  | "other_custom";

export type SituationAnalysis = {
  matchedDomain: CaseDomain;
  title: string;
  description: string;
  locationHint: string;
  recommendedPortalIds: string[];
  nextSteps: string[];
  authority: string;
  engine: "gemini" | "openrouter" | "openai" | "claude" | "template";
};

export interface ClassificationResult {
  category: WasteCategory;
  label: string;
  confidence: number;
  summary: string;
  doList: string[];
  dontList: string[];
  teluguTip: string;
  binColor: string;
  engine:
    | "gemini-vision"
    | "openrouter-vision"
    | "openai-vision"
    | "claude-vision"
    | "local-vision";
  imageDataUrl?: string;
}

export interface FilingGuidePayload {
  summary: string;
  checklist: string[];
  portalSteps: string[];
  formFillTips: Array<{ field: string; tip: string }>;
}

export interface ComplaintDraft {
  subject: string;
  body: string;
  issueType: IssueType;
  caseDomain: CaseDomain;
  location: string;
  engine: "gemini" | "openrouter" | "openai" | "claude" | "template";
  recommendedPortalIds: string[];
  filingGuide: FilingGuidePayload;
}
