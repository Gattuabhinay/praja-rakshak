"use client";

import { useRouter } from "next/navigation";
import { APP_FLOW_SECTIONS, type AppSection } from "@/lib/journey";

type JourneyStripProps = {
  active: AppSection;
  /** If true, steps require auth and go to dashboard sections */
  authed?: boolean;
};

export function JourneyStrip({ active, authed = false }: JourneyStripProps) {
  const router = useRouter();

  function go(section: AppSection) {
    if (!authed) {
      router.push(
        `/login?next=${encodeURIComponent(`/dashboard?section=${section}`)}`,
      );
      return;
    }
    router.push(`/dashboard?section=${section}`);
  }

  return (
    <div className="journey-strip" role="navigation" aria-label="App sections">
      {APP_FLOW_SECTIONS.map((item) => {
        const isActive = item.id === active;
        const activeStep = Number(
          APP_FLOW_SECTIONS.find((s) => s.id === active)?.step ?? 0,
        );
        const isDone = active !== "login" && Number(item.step) < activeStep;

        return (
          <button
            key={item.id}
            type="button"
            className={`journey-pill ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
