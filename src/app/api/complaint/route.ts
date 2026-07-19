import { NextResponse } from "next/server";
import { draftComplaintWithProvider } from "@/lib/aiProviders";
import { draftComplaintTemplate } from "@/lib/complaintCore";
import type { AiProvider } from "@/lib/providers";
import { resolveServerAiAuth } from "@/lib/serverAi";
import { CASE_DOMAINS } from "@/lib/telangana";
import type { CaseDomain, IssueType } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_DOMAINS = Object.keys(CASE_DOMAINS) as CaseDomain[];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      location?: string;
      issueType?: IssueType;
      caseDomain?: CaseDomain;
      details?: string;
      categoryHint?: string;
      officerOrOffice?: string;
      provider?: AiProvider;
      apiKey?: string;
    };

    const location = body.location?.trim();
    const issueType = body.issueType;
    const caseDomain = body.caseDomain;
    const details = body.details?.trim() ?? "";
    const categoryHint = body.categoryHint?.trim();
    const officerOrOffice = body.officerOrOffice?.trim();
    const provider = body.provider;
    const apiKey = body.apiKey?.trim() ?? "";
    if (apiKey && (apiKey.length < 20 || apiKey.length > 512)) {
      return NextResponse.json(
        { error: "API key format looks invalid. Check AI Settings." },
        { status: 400 },
      );
    }

    if (!location) {
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    }

    if (!caseDomain || !ALLOWED_DOMAINS.includes(caseDomain)) {
      return NextResponse.json({ error: "Valid case domain is required." }, { status: 400 });
    }

    const allowedIssues = CASE_DOMAINS[caseDomain].issues;
    if (!issueType || !allowedIssues.includes(issueType)) {
      return NextResponse.json(
        { error: "Issue type does not match the selected case domain." },
        { status: 400 },
      );
    }

    const payload = {
      location,
      issueType,
      caseDomain,
      details,
      categoryHint,
      officerOrOffice,
    };

    const { auth } = resolveServerAiAuth({ provider, apiKey });
    if (auth) {
      try {
        const draft = await draftComplaintWithProvider(auth, payload);
        return NextResponse.json(draft);
      } catch (error) {
        if (provider && apiKey) {
          const admin = resolveServerAiAuth({});
          if (admin.auth) {
            try {
              const draft = await draftComplaintWithProvider(admin.auth, payload);
              return NextResponse.json(draft);
            } catch {
              // fall through to template
            }
          }
        }
        const message =
          error instanceof Error ? error.message : "Provider AI request failed";
        return NextResponse.json(
          {
            error: `AI provider error: ${message}. Check Settings API key.`,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(draftComplaintTemplate(payload));
  } catch (error) {
    console.error("complaint error", error);
    return NextResponse.json(
      { error: "Could not draft complaint. Please try again." },
      { status: 500 },
    );
  }
}
