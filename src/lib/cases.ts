import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CaseDomain, IssueType } from "./types";

export type CaseStatus = "drafted" | "redirected" | "shared_whatsapp";

export type SavedCase = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  caseDomain: CaseDomain;
  issueType: IssueType;
  location: string;
  subject: string;
  body: string;
  portalUrl?: string;
  portalName?: string;
  status: CaseStatus;
  redirectCount: number;
  lastRedirectAt?: string;
  lastRedirectTarget?: string;
};

type CaseRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  case_domain: CaseDomain;
  issue_type: IssueType;
  location: string;
  subject: string;
  body: string;
  portal_url: string | null;
  portal_name: string | null;
  status: CaseStatus;
  redirect_count: number;
  last_redirect_at: string | null;
  last_redirect_target: string | null;
};

function mapCase(row: CaseRow): SavedCase {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    caseDomain: row.case_domain,
    issueType: row.issue_type,
    location: row.location,
    subject: row.subject,
    body: row.body,
    portalUrl: row.portal_url ?? undefined,
    portalName: row.portal_name ?? undefined,
    status: row.status,
    redirectCount: row.redirect_count,
    lastRedirectAt: row.last_redirect_at ?? undefined,
    lastRedirectTarget: row.last_redirect_target ?? undefined,
  };
}

export async function getCasesForUser(userId: string): Promise<SavedCase[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prajasetu_cases")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CaseRow[] | null)?.map(mapCase) ?? [];
}

export async function getCaseStats(userId: string) {
  const cases = await getCasesForUser(userId);
  return {
    total: cases.length,
    drafted: cases.filter((c) => c.status === "drafted").length,
    redirected: cases.filter((c) => c.status === "redirected").length,
    shared: cases.filter((c) => c.status === "shared_whatsapp").length,
  };
}

export async function saveCase(input: {
  userId: string;
  caseDomain: CaseDomain;
  issueType: IssueType;
  location: string;
  subject: string;
  body: string;
  portalUrl?: string;
  portalName?: string;
  status?: CaseStatus;
}): Promise<SavedCase> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prajasetu_cases")
    .insert({
      user_id: input.userId,
      case_domain: input.caseDomain,
      issue_type: input.issueType,
      location: input.location,
      subject: input.subject,
      body: input.body,
      portal_url: input.portalUrl ?? null,
      portal_name: input.portalName ?? null,
      status: input.status ?? "drafted",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapCase(data as CaseRow);
}

export async function markCaseRedirected(
  userId: string,
  caseId: string,
  targetName: string,
  status: CaseStatus = "redirected",
  targetUrl?: string,
  channelType = "government-portal",
) {
  const supabase = getSupabaseBrowserClient();
  const { data: existing, error: readError } = await supabase
    .from("prajasetu_cases")
    .select("redirect_count")
    .eq("id", caseId)
    .eq("user_id", userId)
    .single();

  if (readError) throw new Error(readError.message);

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("prajasetu_cases")
    .update({
      status,
      redirect_count: Number(existing.redirect_count ?? 0) + 1,
      last_redirect_at: now,
      last_redirect_target: targetName,
      updated_at: now,
    })
    .eq("id", caseId)
    .eq("user_id", userId);

  if (updateError) throw new Error(updateError.message);

  await supabase.from("prajasetu_redirect_events").insert({
    case_id: caseId,
    user_id: userId,
    target_name: targetName,
    target_url: targetUrl ?? null,
    channel_type: channelType,
  });
}

export async function deleteCase(userId: string, caseId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("prajasetu_cases")
    .delete()
    .eq("id", caseId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
