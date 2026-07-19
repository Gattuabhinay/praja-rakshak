"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BRAND } from "@/lib/brand";
import { APP_FLOW_SECTIONS, sectionFromPath } from "@/lib/journey";

function HeaderNav() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = sectionFromPath(pathname, searchParams.get("section"));

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <div className="header-brand-row">
          <Link
            href={user ? "/dashboard?section=cleanup" : "/login"}
            className="brand"
          >
            <Image
              src={BRAND.logoSrc}
              alt={`${BRAND.name} logo`}
              width={64}
              height={64}
              className="brand-logo"
              priority
            />
            <span className="brand-text">
              {BRAND.name}
              <small>{user ? "Telangana citizen app" : "Login required"}</small>
            </span>
          </Link>
          {!ready ? null : user ? (
            <button
              type="button"
              className="nav-logout header-logout"
              onClick={() => void logout()}
            >
              Logout
            </button>
          ) : (
            <nav className="nav-links">
              <Link href="/login">Login</Link>
              <Link href="/login?mode=register">Create account</Link>
            </nav>
          )}
        </div>

        {!ready || !user ? null : (
          <nav className="app-step-nav" aria-label="App sections">
            {APP_FLOW_SECTIONS.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                className={`app-step-pill ${active === step.id ? "active" : ""}`}
              >
                {step.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="site-header">
          <div className="shell header-inner">
            <span className="brand-text">{BRAND.name}</span>
          </div>
        </header>
      }
    >
      <HeaderNav />
    </Suspense>
  );
}
