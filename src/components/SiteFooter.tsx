import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner footer-stack">
        <p>
          <strong>{BRAND.name}</strong> · {BRAND.themeShort} · Telangana web app
        </p>
        <p>Flow: Login → Clean Up → Speak Up → Official Portal → Profile</p>
        <p>
          <Link href="/dashboard?section=profile#ai-settings">AI / API settings</Link>
          {" · "}
          <Link href="/dashboard?section=profile#suggestions">
            Suggest improvements / advisory review
          </Link>
        </p>
      </div>
    </footer>
  );
}
