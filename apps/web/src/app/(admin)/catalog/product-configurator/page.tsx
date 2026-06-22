"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  FileStack,
  FolderTree,
  GitBranch,
  Layers,
  Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfiguratorProfiles } from "@/lib/api/use-configurator-profiles";
import { useConfiguratorCategories } from "@/lib/api/use-configurator-categories";
import { useConfiguratorTemplates } from "@/lib/api/use-configurator-templates";
import { useConfiguratorBuilds } from "@/lib/api/use-configurator-builds";
import { useCompatibilityRuleStore } from "@/lib/store/compatibility-rule-store";
import { CONFIGURATOR_ADMIN_BASE } from "@/components/configurator/admin/configurator-admin-page";

const sections = [
  { title: "Profiles", href: `${CONFIGURATOR_ADMIN_BASE}/profiles`, icon: Layers, desc: "PC, Laptop, CCTV builders" },
  { title: "Categories", href: `${CONFIGURATOR_ADMIN_BASE}/categories`, icon: FolderTree, desc: "Component slots per profile" },
  { title: "Rules", href: `${CONFIGURATOR_ADMIN_BASE}/rules`, icon: GitBranch, desc: "IF/THEN/ELSE compatibility" },
  { title: "Templates", href: `${CONFIGURATOR_ADMIN_BASE}/templates`, icon: FileStack, desc: "Starter configurations" },
  { title: "Saved Builds", href: `${CONFIGURATOR_ADMIN_BASE}/builds`, icon: Boxes, desc: "Customer configurations" },
  { title: "Analytics", href: `${CONFIGURATOR_ADMIN_BASE}/analytics`, icon: BarChart3, desc: "Usage & performance" },
];

export default function ProductConfiguratorHubPage() {
  const { total: profileCount } = useConfiguratorProfiles();
  const { total: categoryCount } = useConfiguratorCategories();
  const { total: templateCount } = useConfiguratorTemplates();
  const { total: buildCount } = useConfiguratorBuilds();
  const ruleCount = useCompatibilityRuleStore((s) => s.rules.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">
          <Link href="/catalog" className="hover:text-foreground">Catalog</Link>
          {" › Product Configurator"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Puzzle className="h-5 w-5 text-indigo-600" />
          <h1 className="page-title">Product Configurator</h1>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          ERP-style management for universal build engines — profiles, categories, compatibility rules,
          templates, saved builds, and analytics.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {[
          { label: "Profiles", value: profileCount },
          { label: "Categories", value: categoryCount },
          { label: "Rules", value: ruleCount },
          { label: "Templates", value: templateCount },
          { label: "Builds", value: buildCount },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-input bg-card px-3 py-2 text-center shadow-sm">
            <p className="text-lg font-semibold">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <div key={s.href} className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2">
              <s.icon className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold">{s.title}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href={s.href}>Manage →</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-input bg-muted/20 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Related</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link href="/configurator/attributes">Component Attributes</Link>
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link href="/catalog/product-configurator/rules">Compatibility Rules</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
