"use client";

import { use } from "react";
import { BusinessSettingsCategory } from "@/components/settings/business-settings-category";

type Props = { params: Promise<{ category: string }> };

export default function BusinessSettingsCategoryPage({ params }: Props) {
  const { category } = use(params);
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <BusinessSettingsCategory categoryId={category} />
    </div>
  );
}
