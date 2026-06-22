import Link from "next/link";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { Button } from "@/components/ui/button";

export default function SystemPage() {
  return (
    <div className="space-y-4">
      <SettingsLayerNav />
      <div>
        <p className="page-subtitle">MoharazNX › System</p>
        <h1 className="page-title">System Hub</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Store configuration, payments, shipping, and ecommerce settings.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard
          title="Team users"
          desc="Admin roles — admin, staff, viewer permissions"
          href="/system/users"
        />
        <HubCard
          title="Store Settings"
          desc="Catalog, checkout, payments, and shipping — daily store config"
          href="/settings"
        />
        <HubCard
          title="Business Settings"
          desc="Company profile, tax, and localisation"
          href="/settings/business"
        />
        <HubCard
          title="Plugins"
          desc="Payment gateways, shipping extensions, and integrations"
          href="/settings/plugins"
        />
      </div>
    </div>
  );
}

function HubCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
      <Button variant="outline" size="sm" asChild className="mt-3">
        <Link href={href}>Open</Link>
      </Button>
    </div>
  );
}
