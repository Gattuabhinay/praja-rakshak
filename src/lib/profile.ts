import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CitizenProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  area: string;
  pincode: string;
  preferredLanguage: string;
  gender: string;
  state: string;
};

const DEMO_PROFILE_KEY = "praja_rakshak_demo_profile_v1";

export const TELANGANA_DISTRICTS = [
  "Hyderabad",
  "Rangareddy",
  "Medchal-Malkajgiri",
  "Sangareddy",
  "Vikarabad",
  "Warangal",
  "Hanamkonda",
  "Karimnagar",
  "Nizamabad",
  "Khammam",
  "Nalgonda",
  "Mahabubnagar",
  "Adilabad",
  "Other / Not listed",
] as const;

function emptyProfile(id: string, email = "", fullName = ""): CitizenProfile {
  return {
    id,
    fullName,
    email,
    phone: "",
    district: "Hyderabad",
    area: "",
    pincode: "",
    preferredLanguage: "English",
    gender: "",
    state: "Telangana",
  };
}

function mapRow(row: Record<string, unknown>): CitizenProfile {
  return {
    id: String(row.id ?? ""),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    district: String(row.district ?? "Hyderabad"),
    area: String(row.area ?? ""),
    pincode: String(row.pincode ?? ""),
    preferredLanguage: String(row.preferred_language ?? "English"),
    gender: String(row.gender ?? ""),
    state: String(row.state ?? "Telangana"),
  };
}

function readDemoProfile(userId: string, email: string, name: string): CitizenProfile {
  if (typeof window === "undefined") return emptyProfile(userId, email, name);
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return emptyProfile(userId, email, name);
    const parsed = JSON.parse(raw) as CitizenProfile;
    return {
      ...emptyProfile(userId, email, name),
      ...parsed,
      id: userId,
      email: email || parsed.email,
      fullName: parsed.fullName || name,
    };
  } catch {
    return emptyProfile(userId, email, name);
  }
}

function writeDemoProfile(profile: CitizenProfile) {
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
}

export function profileCompleteness(profile: CitizenProfile) {
  const checks = [
    Boolean(profile.fullName.trim()),
    Boolean(profile.phone.trim().length >= 10),
    Boolean(profile.district.trim()),
    Boolean(profile.area.trim()),
    Boolean(profile.pincode.trim().length >= 6),
  ];
  const done = checks.filter(Boolean).length;
  return {
    done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
    ready: done === checks.length,
  };
}

export async function getCitizenProfile(input: {
  userId: string;
  email: string;
  name: string;
  isLocalDemo?: boolean;
}): Promise<CitizenProfile> {
  if (input.isLocalDemo) {
    return readDemoProfile(input.userId, input.email, input.name);
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prajasetu_profiles")
    .select(
      "id,full_name,email,phone,district,area,pincode,preferred_language,gender,state",
    )
    .eq("id", input.userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    return emptyProfile(input.userId, input.email, input.name);
  }
  const mapped = mapRow(data as Record<string, unknown>);
  return {
    ...mapped,
    email: mapped.email || input.email,
    fullName: mapped.fullName || input.name,
  };
}

export async function saveCitizenProfile(
  profile: CitizenProfile,
  options?: { isLocalDemo?: boolean },
): Promise<CitizenProfile> {
  const clean: CitizenProfile = {
    ...profile,
    fullName: profile.fullName.trim(),
    phone: profile.phone.trim(),
    district: profile.district.trim(),
    area: profile.area.trim(),
    pincode: profile.pincode.trim(),
    preferredLanguage: profile.preferredLanguage.trim() || "English",
    gender: profile.gender.trim(),
    state: "Telangana",
  };

  if (!clean.fullName) throw new Error("Full name is required.");
  if (clean.phone && clean.phone.replace(/\D/g, "").length < 10) {
    throw new Error("Enter a valid 10-digit phone number.");
  }
  if (clean.pincode && !/^\d{6}$/.test(clean.pincode)) {
    throw new Error("PIN code must be 6 digits.");
  }

  if (options?.isLocalDemo) {
    writeDemoProfile(clean);
    return clean;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prajasetu_profiles")
    .upsert({
      id: clean.id,
      full_name: clean.fullName,
      email: clean.email,
      phone: clean.phone || null,
      district: clean.district || null,
      area: clean.area || null,
      pincode: clean.pincode || null,
      preferred_language: clean.preferredLanguage || "English",
      gender: clean.gender || null,
      state: "Telangana",
      updated_at: new Date().toISOString(),
    })
    .select(
      "id,full_name,email,phone,district,area,pincode,preferred_language,gender,state",
    )
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}
