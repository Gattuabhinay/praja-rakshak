/** Single source of truth for product positioning */
export const BRAND = {
  name: "Praja Rakshak",
  shortName: "PrajaRakshak",
  logoSrc: "/brand/praja-rakshak-logo.png",
  telanganaEmblemSrc: "/brand/telangana-emblem.png",
  theme: "Theme 1 · Sustainability & Social Impact",
  themeShort: "Social Impact",
  state: "Telangana",
  stateOfficial: "Government of Telangana",
  tagline: "Your Voice · Your Rights · Registered",
  oneLiner:
    "AI that helps Telangana citizens segregate waste and file real civic complaints — lawfully.",
  promise:
    "One platform. Two actions. AI prepares. Government portals file.",
  paths: {
    clean: {
      title: "Clean Up",
      href: "/dashboard?section=cleanup",
      line: "Photo → AI tells the correct waste bin",
    },
    speak: {
      title: "Speak Up",
      href: "/dashboard?section=speakup",
      line: "AI drafts complaint → you file on official portal",
    },
    portals: {
      title: "Official Portal",
      href: "/dashboard?section=portals",
      line: "Official Telangana government websites to file reports",
    },
    profile: {
      title: "Profile",
      href: "/dashboard?section=profile",
      line: "Citizen details + case history in one place",
    },
    login: {
      title: "Login",
      href: "/login",
      line: "Citizen login to enter Praja Rakshak",
    },
  },
} as const;
