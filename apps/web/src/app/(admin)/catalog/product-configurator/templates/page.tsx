"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfiguratorAdminPage } from "@/components/configurator/admin/configurator-admin-page";
import { ConfiguratorTemplatesList } from "@/components/configurator/admin/configurator-templates-list";
import { useConfiguratorTemplateStore } from "@/lib/store/configurator-template-store";

export default function ConfiguratorTemplatesPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useConfiguratorTemplateStore((s) => s.templates.length);

  return (
    <ConfiguratorAdminPage
      section="Templates"
      title="Build Templates"
      count={count}
      description="Pre-configured starter builds customers can load into the configurator."
      createLabel="Create template"
      onCreate={() => setAddTrigger((n) => n + 1)}
    >
      <ConfiguratorTemplatesList addTrigger={addTrigger} />
      <Button size="sm" className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden" onClick={() => setAddTrigger((n) => n + 1)} aria-label="Create template">
        <Plus className="h-5 w-5" />
      </Button>
    </ConfiguratorAdminPage>
  );
}
