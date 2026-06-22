"use client";

import { companies, branches } from "@/lib/navigation";
import { useAppStore } from "@/lib/store/app-store";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Welcome strip — not a draggable widget per blueprint. */
export function WelcomeArea() {
  const companyId = useAppStore((s) => s.companyId);
  const branchId = useAppStore((s) => s.branchId);
  const company = companies.find((c) => c.id === companyId)?.name ?? "Company";
  const branch = branches.find((b) => b.id === branchId)?.name ?? "Branch";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <section
      className="rounded-lg border bg-gradient-to-r from-primary/5 via-background to-background p-4"
      data-component="WS-CONTENT-WELCOME"
      aria-label="Welcome"
    >
      <p className="text-xs text-muted-foreground">Welcome back</p>
      <h2 className="page-title">{greeting}, Admin</h2>
      <p className="page-subtitle">
        {company} · {branch} · FY 2026
      </p>
    </section>
  );
}
