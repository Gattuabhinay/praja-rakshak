import { NextResponse } from "next/server";
import { classifyWithProvider } from "@/lib/aiProviders";
import { classifyOffline } from "@/lib/classifyOffline";
import { isAiProvider, type AiProvider } from "@/lib/providers";
import { resolveServerAiAuth } from "@/lib/serverAi";

export const runtime = "nodejs";

function parseProvider(value: FormDataEntryValue | null): AiProvider | null {
  const raw = String(value ?? "");
  return isAiProvider(raw) ? raw : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const fileName = String(formData.get("fileName") ?? "");
    const provider = parseProvider(formData.get("provider"));
    const apiKey = String(formData.get("apiKey") ?? "").trim();
    if (apiKey && (apiKey.length < 20 || apiKey.length > 512)) {
      return NextResponse.json(
        { error: "API key format looks invalid. Check AI Settings." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 8MB." },
        { status: 400 },
      );
    }

    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const imageBase64 = bytes.toString("base64");

    const { auth, source } = resolveServerAiAuth({ provider, apiKey });

    if (auth) {
      try {
        const result = await classifyWithProvider(auth, imageBase64, mimeType);
        return NextResponse.json({
          ...result,
          imageDataUrl: `data:${mimeType};base64,${imageBase64}`,
          aiSource: source,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Provider AI request failed";
        // If user key failed, try admin once more; if admin failed, fall local.
        if (source === "user") {
          const admin = resolveServerAiAuth({});
          if (admin.auth) {
            try {
              const result = await classifyWithProvider(
                admin.auth,
                imageBase64,
                mimeType,
              );
              return NextResponse.json({
                ...result,
                imageDataUrl: `data:${mimeType};base64,${imageBase64}`,
                aiSource: admin.source,
              });
            } catch {
              // continue to offline
            }
          }
        }
        return NextResponse.json(
          {
            error: `AI provider error: ${message}. Check your API key in Settings.`,
          },
          { status: 400 },
        );
      }
    }

    const result = await classifyOffline(
      imageBase64,
      mimeType,
      fileName || file.name,
    );

    return NextResponse.json({
      ...result,
      imageDataUrl: `data:${mimeType};base64,${imageBase64}`,
      aiSource: "none",
    });
  } catch (error) {
    console.error("classify error", error);
    return NextResponse.json(
      { error: "Could not classify this image. Try another clear photo." },
      { status: 500 },
    );
  }
}
