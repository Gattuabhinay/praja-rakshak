"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?section=speakup");
  }, [router]);
  return (
    <div className="page">
      <div className="shell">
        <p className="lede">Opening Speak Up section…</p>
      </div>
    </div>
  );
}
