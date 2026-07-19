import type { CaseDomain } from "./types";

export type WhatsAppChannel = {
  id: string;
  label: string;
  number: string;
  href: string;
  note: string;
  domains: CaseDomain[];
  authority: "GHMC" | "ACB" | "SHE Teams";
};

/** Official Telangana / government WhatsApp grievance channels only */
export const WHATSAPP_CHANNELS: WhatsAppChannel[] = [
  {
    id: "ghmc-wa",
    label: "Official GHMC WhatsApp",
    number: "8125966586",
    href: "https://wa.me/918125966586",
    note: "Government of Telangana / GHMC official WhatsApp for waste, sanitation, and clean-city grievances.",
    domains: ["waste"],
    authority: "GHMC",
  },
  {
    id: "acb-wa",
    label: "Official ACB WhatsApp",
    number: "8333995858",
    href: "https://wa.me/918333995858",
    note: "Anti Corruption Bureau (ACB) Telangana official WhatsApp for bribery and corruption reports.",
    domains: ["police_bribery", "govt_corruption"],
    authority: "ACB",
  },
  {
    id: "she-teams-wa",
    label: "Official SHE Teams WhatsApp",
    number: "8712656856",
    href: "https://wa.me/918712656856",
    note: "Telangana Police SHE Teams official WhatsApp for women harassment / safety complaints.",
    domains: ["women_safety"],
    authority: "SHE Teams",
  },
];

/** Exact official channel by case type */
export function officialWhatsAppForDomain(
  domain: CaseDomain,
): WhatsAppChannel | null {
  if (domain === "waste") {
    return WHATSAPP_CHANNELS.find((c) => c.id === "ghmc-wa") ?? null;
  }
  if (domain === "police_bribery" || domain === "govt_corruption") {
    return WHATSAPP_CHANNELS.find((c) => c.id === "acb-wa") ?? null;
  }
  if (domain === "women_safety") {
    return WHATSAPP_CHANNELS.find((c) => c.id === "she-teams-wa") ?? null;
  }
  return null;
}

export function whatsappChannelsFor(domain: CaseDomain): WhatsAppChannel[] {
  const official = officialWhatsAppForDomain(domain);
  return official ? [official] : [];
}

export function buildWhatsAppShareUrl(text: string, phone?: string) {
  const payload = encodeURIComponent(text.slice(0, 3500));
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    const withCountry = digits.startsWith("91") ? digits : `91${digits}`;
    return `https://wa.me/${withCountry}?text=${payload}`;
  }
  return `https://wa.me/?text=${payload}`;
}

export function buildOfficialWhatsAppUrl(
  channel: WhatsAppChannel,
  text: string,
) {
  return `${channel.href}?text=${encodeURIComponent(text.slice(0, 3500))}`;
}

export function officialWhatsAppButtonLabel(channel: WhatsAppChannel) {
  return `Send to official ${channel.authority} WhatsApp`;
}
