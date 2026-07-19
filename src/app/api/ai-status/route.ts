import { NextResponse } from "next/server";
import { hasAdminAiKey } from "@/lib/serverAi";

export const runtime = "nodejs";

/** Public status only — never returns the actual key. */
export async function GET() {
  const adminReady = hasAdminAiKey();
  return NextResponse.json({
    adminReady,
    label: adminReady
      ? "Admin AI ready (OpenRouter / Gemini server key)"
      : "No admin AI key — local / template fallback only",
  });
}
