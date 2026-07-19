import { NextResponse } from "next/server";
import { analyzeSituationWithProvider } from "@/lib/aiProviders";
import type { AiProvider } from "@/lib/providers";
import { resolveServerAiAuth } from "@/lib/serverAi";
import { analyzeSituationTemplate } from "@/lib/situationAnalysis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      situation?: string;
      provider?: AiProvider;
      apiKey?: string;
    };

    const situation = body.situation?.trim() ?? "";
    const provider = body.provider;
    const apiKey = body.apiKey?.trim() ?? "";

    if (situation.length < 20) {
      return NextResponse.json(
        {
          error:
            "Please describe your situation in at least a few sentences (min 20 characters).",
        },
        { status: 400 },
      );
    }

    if (situation.length > 4000) {
      return NextResponse.json(
        { error: "Situation text is too long (max 4000 characters)." },
        { status: 400 },
      );
    }

    if (apiKey && (apiKey.length < 20 || apiKey.length > 512)) {
      return NextResponse.json(
        { error: "API key format looks invalid. Check AI Settings." },
        { status: 400 },
      );
    }

    const { auth } = resolveServerAiAuth({ provider, apiKey });
    if (auth) {
      try {
        const analysis = await analyzeSituationWithProvider(auth, situation);
        return NextResponse.json(analysis);
      } catch (error) {
        if (provider && apiKey) {
          const admin = resolveServerAiAuth({});
          if (admin.auth) {
            try {
              const analysis = await analyzeSituationWithProvider(
                admin.auth,
                situation,
              );
              return NextResponse.json(analysis);
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

    return NextResponse.json(analyzeSituationTemplate(situation));
  } catch (error) {
    console.error("analyze-situation error", error);
    return NextResponse.json(
      { error: "Could not analyze situation. Please try again." },
      { status: 500 },
    );
  }
}
