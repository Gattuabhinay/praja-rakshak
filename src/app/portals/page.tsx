"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?section=portals");
  }, [router]);
  return (
    <div className="page">
      <div className="shell">
        <p className="lede">Opening Official Portal section…</p>
      </div>
    </div>
  );
}
