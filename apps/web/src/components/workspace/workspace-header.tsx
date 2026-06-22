"use client";

import Link from "next/link";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { BRAND_NAME } from "@/lib/brand";

/** WS-HEADER-* — Zone A global header (56px). */
export function WorkspaceHeader() {
  return (
    <div data-zone="A" data-component="WS-HEADER">
      <TopNavigation
        leading={
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-semibold tracking-tight text-foreground lg:hidden"
          >
            {BRAND_NAME}
          </Link>
        }
      />
    </div>
  );
}
