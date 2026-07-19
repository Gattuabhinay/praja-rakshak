import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildStaticFilingGuide,
  draftComplaintTemplate,
  normalizeFilingGuide,
} from "./complaintCore";
import type { AiProvider } from "./providers";
import { AI_PROVIDERS } from "./providers";
import {
  CASE_DOMAINS,
  ISSUE_LABELS,
  recommendedPortalIds,
} from "./telangana";
import {
  analyzeSituationTemplate,
  normalizeMatchedDomain,
} from "./situationAnalysis";
import type {
  CaseDomain,
  ClassificationResult,
  ComplaintDraft,
  IssueType,
  SituationAnalysis,
} from "./types";
import { CATEGORY_META, normalizeCategory } from "./waste";

export type ProviderAuth = {
  provider: AiProvider;
  apiKey: string;
};

function engineFor(provider: AiProvider, kind: "vision" | "text") {
  if (provider === "gemini") return kind === "vision" ? "gemini-vision" : "gemini";
  if (provider === "openrouter") {
    return kind === "vision" ? "openrouter-vision" : "openrouter";
  }
  if (provider === "openai") {
    return kind === "vision" ? "openai-vision" : "openai";
  }
  return kind === "vision" ? "claude-vision" : "claude";
}

export async function classifyWithProvider(
  auth: ProviderAuth,
  imageBase64: string,
  mimeType: string,
): Promise<ClassificationResult> {
  const prompt = `You are an expert waste-segregation AI for Telangana / Indian municipal waste systems.
Analyze the image and classify the PRIMARY waste into exactly one category:
- wet
- dry
- hazardous
- ewaste
- mixed

Return ONLY valid JSON:
{
  "category": "wet|dry|hazardous|ewaste|mixed",
  "confidence": 0.0,
  "summary": "one short sentence",
  "doList": ["tip1", "tip2", "tip3"],
  "dontList": ["tip1", "tip2", "tip3"],
  "teluguTip": "one short tip in Telugu"
}`;

  const text = await runVisionPrompt(auth, prompt, imageBase64, mimeType);
  const json = extractJson(text);
  const category = normalizeCategory(String(json.category ?? "mixed"));
  const meta = CATEGORY_META[category];

  return {
    category,
    label: meta.label,
    confidence: clampConfidence(Number(json.confidence ?? 0.75)),
    summary: String(json.summary ?? meta.summary),
    doList: asStringArray(json.doList, meta.doList),
    dontList: asStringArray(json.dontList, meta.dontList),
    teluguTip: String(json.teluguTip ?? meta.teluguTip),
    binColor: meta.binColor,
    engine: engineFor(auth.provider, "vision") as ClassificationResult["engine"],
  };
}

export async function draftComplaintWithProvider(
  auth: ProviderAuth,
  input: {
    location: string;
    issueType: IssueType;
    caseDomain: CaseDomain;
    details: string;
    categoryHint?: string;
    officerOrOffice?: string;
  },
): Promise<ComplaintDraft> {
  const issueLabel = ISSUE_LABELS[input.issueType] ?? input.issueType;
  const domainMeta = CASE_DOMAINS[input.caseDomain];
  const staticGuide = buildStaticFilingGuide(input.caseDomain);

  const prompt = `You are an AI complaint-filing guide for Telangana citizens.
Draft a formal complaint AND guide how to fill the official portal form.

Case domain: ${domainMeta.title}
Issue type: ${issueLabel}
Location: ${input.location}
Office / officer involved (if any): ${input.officerOrOffice || "Not provided"}
Extra details: ${input.details || "Not provided"}
Related hint: ${input.categoryHint || "Not provided"}
Target authority: ${domainMeta.authority}

Rules:
- Formal, factual, non-abusive language
- Do not invent case numbers, FIR numbers, or fake proof
- Suitable to paste into official portals
- Filing tips must be practical field-by-field guidance

Return ONLY JSON:
{
  "subject": "short subject line",
  "body": "formal complaint body",
  "filingGuide": {
    "summary": "2-3 sentence guide on how to file this complaint",
    "checklist": ["item1", "item2", "item3", "item4"],
    "portalSteps": ["step1", "step2", "step3", "step4", "step5"],
    "formFillTips": [
      {"field": "form field name", "tip": "exactly what user should enter"},
      {"field": "form field name", "tip": "exactly what user should enter"}
    ]
  }
}`;

  try {
    const text = await runTextPrompt(auth, prompt);
    const json = extractJson(text);
    return {
      subject: String(json.subject ?? `Complaint regarding ${issueLabel}`),
      body: String(json.body ?? ""),
      issueType: input.issueType,
      caseDomain: input.caseDomain,
      location: input.location,
      engine: engineFor(auth.provider, "text") as ComplaintDraft["engine"],
      recommendedPortalIds: recommendedPortalIds(input.caseDomain),
      filingGuide: normalizeFilingGuide(json.filingGuide, input.caseDomain),
    };
  } catch {
    return {
      ...draftComplaintTemplate(input),
      engine: "template",
      filingGuide: staticGuide,
    };
  }
}

export async function analyzeSituationWithProvider(
  auth: ProviderAuth,
  situation: string,
): Promise<SituationAnalysis> {
  const fallback = analyzeSituationTemplate(situation);
  const prompt = `You are Praja Rakshak, an AI civic-complaint guide for Telangana citizens.
The user selected "Other" and described a situation that may not match a fixed case card.
Analyze the situation and return the best official path.

Citizen situation:
"""
${situation.trim()}
"""

Match matchedDomain to exactly one of:
- waste (garbage, sanitation, dumping, pollution, GHMC)
- police_bribery (police demanding bribe/money)
- fir_refusal (police refusing to register FIR/complaint)
- govt_corruption (government official / public servant bribe or corruption)
- women_safety (online/social media harassment, stalking, cyber blackmail, SHE Teams, workplace sexual harassment, domestic violence safety)
- social_legal (welfare denial, document fraud, other legal/social grievance)

Rules:
- Formal, factual, non-abusive
- Do not invent FIR numbers, dates, or fake evidence
- description must be a ready-to-paste official complaint description paragraph(s)
- nextSteps must be practical Telangana / India official filing steps
- recommendedPortalIds must be chosen from: ghmc-igs, ghmc-home, tspcb, acb, lokayukta, ts-police, cybercrime, women-safety-wing, she-box, ncw, cpgrams, telangana-gov

Return ONLY JSON:
{
  "matchedDomain": "waste|police_bribery|fir_refusal|govt_corruption|women_safety|social_legal",
  "title": "short case title",
  "description": "perfect formal complaint description for portals",
  "locationHint": "best location string if mentioned, else Hyderabad, Telangana",
  "recommendedPortalIds": ["portal-id-1", "portal-id-2", "portal-id-3"],
  "nextSteps": ["step1", "step2", "step3", "step4"],
  "authority": "who should handle this"
}`;

  try {
    const text = await runTextPrompt(auth, prompt);
    const json = extractJson(text);
    const matchedDomain = normalizeMatchedDomain(json.matchedDomain);
    const portalIds = asStringArray(
      json.recommendedPortalIds,
      recommendedPortalIds(matchedDomain),
    ).filter((id) =>
      [
        "ghmc-igs",
        "ghmc-home",
        "tspcb",
        "acb",
        "lokayukta",
        "ts-police",
        "cybercrime",
        "women-safety-wing",
        "she-box",
        "ncw",
        "cpgrams",
        "telangana-gov",
      ].includes(id),
    );

    return {
      matchedDomain,
      title: String(json.title ?? CASE_DOMAINS[matchedDomain].title),
      description: String(json.description ?? fallback.description),
      locationHint: String(json.locationHint ?? fallback.locationHint),
      recommendedPortalIds:
        portalIds.length > 0 ? portalIds : recommendedPortalIds(matchedDomain),
      nextSteps: asStringArray(json.nextSteps, fallback.nextSteps),
      authority: String(json.authority ?? CASE_DOMAINS[matchedDomain].authority),
      engine: engineFor(auth.provider, "text") as SituationAnalysis["engine"],
    };
  } catch {
    return fallback;
  }
}

async function runVisionPrompt(
  auth: ProviderAuth,
  prompt: string,
  imageBase64: string,
  mimeType: string,
) {
  if (auth.provider === "gemini") {
    return geminiVision(auth.apiKey, prompt, imageBase64, mimeType);
  }
  if (auth.provider === "openrouter") {
    return openRouterChat(auth.apiKey, prompt, {
      imageBase64,
      mimeType,
    });
  }
  if (auth.provider === "openai") {
    return openAiChat(auth.apiKey, prompt, {
      imageBase64,
      mimeType,
    });
  }
  return claudeChat(auth.apiKey, prompt, { imageBase64, mimeType });
}

async function runTextPrompt(auth: ProviderAuth, prompt: string) {
  if (auth.provider === "gemini") {
    return geminiText(auth.apiKey, prompt);
  }
  if (auth.provider === "openrouter") {
    return openRouterChat(auth.apiKey, prompt);
  }
  if (auth.provider === "openai") {
    return openAiChat(auth.apiKey, prompt);
  }
  return claudeChat(auth.apiKey, prompt);
}

async function geminiVision(
  apiKey: string,
  prompt: string,
  imageBase64: string,
  mimeType: string,
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: unknown;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType } },
      ]);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Gemini vision failed");
}

async function geminiText(apiKey: string, prompt: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: unknown;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Gemini text failed");
}

const OPENROUTER_MODEL_FALLBACKS = [
  AI_PROVIDERS.openrouter.defaultModel,
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
];

async function openRouterChat(
  apiKey: string,
  prompt: string,
  image?: { imageBase64: string; mimeType: string },
) {
  const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
  if (image) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.imageBase64}`,
      },
    });
  }

  // OpenRouter reserves credits against max_tokens. Default ~65535 fails on
  // small balances even when the real reply only needs a few hundred tokens.
  const maxTokens = image ? 900 : 1400;
  // Prefer smaller caps first when the account is low on credits
  const maxTokenAttempts = [maxTokens, 700, 400];

  const models = [...new Set(OPENROUTER_MODEL_FALLBACKS)];
  let lastError = "OpenRouter request failed";

  for (const model of models) {
    for (const max_tokens of maxTokenAttempts) {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://praja-rakshak.local",
            "X-Title": "Praja Rakshak Telangana",
          },
          body: JSON.stringify({
            model,
            max_tokens,
            messages: [{ role: "user", content }],
          }),
        },
      );

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        lastError = data.error?.message || `OpenRouter failed for ${model}`;
        // Retry with fewer max_tokens when balance is too low for the reserve
        if (/more credits|fewer max_tokens|can only afford/i.test(lastError)) {
          continue;
        }
        // Try next model when this one has no live endpoints
        if (/no endpoints|not found|404|unavailable/i.test(lastError)) {
          break;
        }
        throw new Error(lastError);
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        lastError = `OpenRouter returned empty response for ${model}`;
        continue;
      }
      return text;
    }
  }

  throw new Error(lastError);
}

async function openAiChat(
  apiKey: string,
  prompt: string,
  image?: { imageBase64: string; mimeType: string },
) {
  const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
  if (image) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.imageBase64}`,
      },
    });
  }

  const models = [
    AI_PROVIDERS.openai.defaultModel,
    "gpt-4o-mini",
    "gpt-4o",
  ];
  const maxTokens = image ? 900 : 1400;
  let lastError = "OpenAI request failed";

  for (const model of [...new Set(models)]) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content }],
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      lastError = data.error?.message || `OpenAI failed for ${model}`;
      if (/model|not found|does not exist|404/i.test(lastError)) {
        continue;
      }
      throw new Error(lastError);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      lastError = `OpenAI returned empty response for ${model}`;
      continue;
    }
    return text;
  }

  throw new Error(lastError);
}

async function claudeChat(
  apiKey: string,
  prompt: string,
  image?: { imageBase64: string; mimeType: string },
) {
  const content: Array<Record<string, unknown>> = [];
  if (image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mimeType,
        data: image.imageBase64,
      },
    });
  }
  content.push({ type: "text", text: prompt });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.claude.defaultModel,
      max_tokens: 1800,
      messages: [{ role: "user", content }],
    }),
  });

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "Claude request failed");
  }

  const text = data.content?.find((part) => part.type === "text")?.text;
  if (!text) throw new Error("Claude returned empty response");
  return text;
}

function extractJson(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map(String).filter(Boolean);
  return items.length ? items.slice(0, 6) : fallback;
}

function clampConfidence(value: number) {
  if (Number.isNaN(value)) return 0.7;
  return Math.min(0.99, Math.max(0.4, value));
}
