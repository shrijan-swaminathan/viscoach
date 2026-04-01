"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CoachIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/coach/library");
  }, [router]);

  return null;
}
