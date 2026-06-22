"use client";

import { ConfiguratorAdminPage } from "@/components/configurator/admin/configurator-admin-page";
import { ConfiguratorBuildsList } from "@/components/configurator/admin/configurator-builds-list";
import { useConfiguratorBuildStore } from "@/lib/store/configurator-build-store";

export default function ConfiguratorBuildsPage() {
  const count = useConfiguratorBuildStore((s) => s.builds.length);

  return (
    <ConfiguratorAdminPage
      section="Saved Builds"
      title="Saved Builds"
      count={count}
      description="Customer and guest configurations — compatibility status, order conversion, audit history."
    >
      <ConfiguratorBuildsList />
    </ConfiguratorAdminPage>
  );
}
