"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";
import { ConfiguratorAttributeProfilesList } from "@/components/configurator/configurator-attribute-profiles-list";
import { useConfiguratorAttributeStore } from "@/lib/store/configurator-attribute-store";

export default function ConfiguratorAttributesPage() {
  const count = useConfiguratorAttributeStore((s) => s.profiles.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">
          <Link href="/configurator" className="hover:text-foreground">
            Configurator
          </Link>
          {" › Component Attributes"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-600" />
          <h1 className="page-title">
            Component Attribute Profiles
            <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
          </h1>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Dynamic attributes per component category — Socket, TDP, Chipset, RAM Type, etc. Powers compatibility
          rules in the Product Configurator Engine.
        </p>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <ConfiguratorAttributeProfilesList />
      </div>
    </div>
  );
}
