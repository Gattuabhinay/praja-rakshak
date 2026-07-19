export type AppSection =
  | "login"
  | "cleanup"
  | "speakup"
  | "portals"
  | "profile"
  | "history";

export const APP_SECTIONS: Array<{
  id: AppSection;
  step: string;
  label: string;
  href: string;
}> = [
  { id: "login", step: "0", label: "Login", href: "/login" },
  {
    id: "cleanup",
    step: "1",
    label: "Clean Up",
    href: "/dashboard?section=cleanup",
  },
  {
    id: "speakup",
    step: "2",
    label: "Speak Up",
    href: "/dashboard?section=speakup",
  },
  {
    id: "portals",
    step: "3",
    label: "Portal",
    href: "/dashboard?section=portals",
  },
  {
    id: "profile",
    step: "4",
    label: "Profile",
    href: "/dashboard?section=profile",
  },
];

/** In-app nav / journey chips — no Login pill, no numbers */
export const APP_FLOW_SECTIONS = APP_SECTIONS.filter((s) => s.id !== "login");

export function parseSection(value: string | null | undefined): AppSection {
  if (value === "history") return "profile";
  if (
    value === "cleanup" ||
    value === "speakup" ||
    value === "portals" ||
    value === "profile" ||
    value === "login"
  ) {
    return value;
  }
  return "cleanup";
}

export function sectionFromPath(pathname: string, sectionParam?: string | null) {
  if (pathname.startsWith("/login")) return "login" as const;
  if (pathname.startsWith("/dashboard")) return parseSection(sectionParam);
  if (pathname.startsWith("/classify")) return "cleanup" as const;
  if (pathname.startsWith("/report")) return "speakup" as const;
  if (pathname.startsWith("/portals")) return "portals" as const;
  if (pathname.startsWith("/history") || pathname.startsWith("/profile")) {
    return "profile" as const;
  }
  return "cleanup" as const;
}
