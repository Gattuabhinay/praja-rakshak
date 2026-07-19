"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { ClassifyClient } from "@/components/ClassifyClient";
import { ReportClient } from "@/components/ReportClient";
import { PortalsSection } from "@/components/PortalsSection";
import { ProfileSection } from "@/components/ProfileSection";
import { parseSection, type AppSection } from "@/lib/journey";

function DashboardSections() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const section = parseSection(searchParams.get("section")) as Exclude<
    AppSection,
    "login" | "history"
  >;

  useEffect(() => {
    const raw = searchParams.get("section");
    if (!raw) {
      router.replace("/dashboard?section=cleanup");
      return;
    }
    if (raw === "history") {
      router.replace("/dashboard?section=profile");
    }
  }, [searchParams, router]);

  return (
    <div className="page">
      <div className="shell">
        <div id="section-cleanup" hidden={section !== "cleanup"}>
          {section === "cleanup" ? <ClassifyClient /> : null}
        </div>
        <div id="section-speakup" hidden={section !== "speakup"}>
          {section === "speakup" ? <ReportClient /> : null}
        </div>
        <div id="section-portals" hidden={section !== "portals"}>
          {section === "portals" ? <PortalsSection /> : null}
        </div>
        <div id="section-profile" hidden={section !== "profile"}>
          {section === "profile" ? <ProfileSection /> : null}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="page">
            <div className="shell">
              <p className="lede">Loading app sections…</p>
            </div>
          </div>
        }
      >
        <DashboardSections />
      </Suspense>
    </RequireAuth>
  );
}
