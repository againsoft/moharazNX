"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfiguratorAdminPage } from "@/components/configurator/admin/configurator-admin-page";
import { ConfiguratorCategoriesList } from "@/components/configurator/admin/configurator-categories-list";
import { useConfiguratorCategoryStore } from "@/lib/store/configurator-category-store";

export default function ConfiguratorCategoriesPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useConfiguratorCategoryStore((s) => s.categories.length);

  return (
    <ConfiguratorAdminPage
      section="Categories"
      title="Component Categories"
      count={count}
      description="Component slots per builder profile — CPU, Motherboard, RAM. Map catalog products and set required/optional."
      createLabel="Create category"
      onCreate={() => setAddTrigger((n) => n + 1)}
    >
      <ConfiguratorCategoriesList addTrigger={addTrigger} />
      <Button size="sm" className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden" onClick={() => setAddTrigger((n) => n + 1)} aria-label="Create category">
        <Plus className="h-5 w-5" />
      </Button>
    </ConfiguratorAdminPage>
  );
}
