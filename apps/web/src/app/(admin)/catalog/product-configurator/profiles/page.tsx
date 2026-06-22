"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfiguratorAdminPage } from "@/components/configurator/admin/configurator-admin-page";
import { ConfiguratorProfilesList } from "@/components/configurator/admin/configurator-profiles-list";
import { useConfiguratorProfileStore } from "@/lib/store/configurator-profile-store";

export default function ConfiguratorProfilesPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useConfiguratorProfileStore((s) => s.profiles.length);

  return (
    <ConfiguratorAdminPage
      section="Profiles"
      title="Configurator Profiles"
      count={count}
      description="Define builder types — PC Builder, Laptop Builder, CCTV Builder. Each profile owns categories, rules, and templates."
      createLabel="Create profile"
      onCreate={() => setAddTrigger((n) => n + 1)}
    >
      <ConfiguratorProfilesList addTrigger={addTrigger} />
      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Create profile"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </ConfiguratorAdminPage>
  );
}
