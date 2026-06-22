"use client";

import Link from "next/link";
import { use } from "react";
import { ConfiguratorAttributeProfileBuilder } from "@/components/configurator/configurator-attribute-profile-builder";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ConfiguratorAttributeProfilePage({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <ConfiguratorAttributeProfileBuilder profileId={id} />
    </div>
  );
}
