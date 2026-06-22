"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { LocalisationListPage } from "@/components/localisation/localisation-list-page";
import { getLocalisationResource } from "@/lib/localisation/resources";

type Props = {
  params: Promise<{ resource: string }>;
};

export default function LocalisationResourcePage({ params }: Props) {
  const { resource: resourceId } = use(params);
  const resource = getLocalisationResource(resourceId);

  if (!resource) {
    notFound();
  }

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › System › Settings › Localisation</p>
        <h1 className="page-title">{resource.title}</h1>
      </div>
      <LocalisationListPage resource={resource} />
    </div>
  );
}
