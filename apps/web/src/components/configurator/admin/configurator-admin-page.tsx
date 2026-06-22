"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = "/catalog/product-configurator";

type Props = {
  section: string;
  title: string;
  count?: number;
  description: string;
  children: ReactNode;
  createLabel?: string;
  onCreate?: () => void;
  addTrigger?: number;
  setAddTrigger?: (fn: (n: number) => number) => void;
};

export function ConfiguratorAdminPage({
  section,
  title,
  count,
  description,
  children,
  createLabel,
  onCreate,
}: Props) {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/catalog" className="hover:text-foreground">Catalog</Link>
            {" › "}
            <Link href={BASE} className="hover:text-foreground">Product Configurator</Link>
            {` › ${section}`}
          </p>
          <h1 className="page-title">
            {title}
            {count !== undefined && (
              <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
            )}
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
        </div>
        {createLabel && onCreate && (
          <Button size="sm" className="hidden sm:flex" onClick={onCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {createLabel}
          </Button>
        )}
      </div>
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </div>
  );
}

export { BASE as CONFIGURATOR_ADMIN_BASE };
