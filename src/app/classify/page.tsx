"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClassifyPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?section=cleanup");
  }, [router]);
  return (
    <div className="page">
      <div className="shell">
        <p className="lede">Opening Clean Up section…</p>
      </div>
    </div>
  );
}
