"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?section=profile");
  }, [router]);
  return (
    <div className="page">
      <div className="shell">
        <p className="lede">Opening Profile…</p>
      </div>
    </div>
  );
}
