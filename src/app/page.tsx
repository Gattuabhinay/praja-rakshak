"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BRAND } from "@/lib/brand";

export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace("/dashboard?section=cleanup");
      return;
    }
    router.replace("/login");
  }, [ready, user, router]);

  return (
    <section className="hero">
      <div className="hero-media" aria-hidden />
      <div className="shell hero-copy">
        <p className="eyebrow">
          {BRAND.themeShort} · {BRAND.state}
        </p>
        <h1>{BRAND.name}</h1>
        <p>First step: Login or Create account to use the web app.</p>
        <div className="cta-row">
          <Link href="/login" className="btn btn-accent">
            Login
          </Link>
          <Link href="/login?mode=register" className="btn btn-ghost">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
