"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreSettingsForm } from "@/components/settings/store-settings-form";
import { getStoreById } from "@/lib/mock-data/stores";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default function StoreSettingsPage({ params }: Props) {
  const { id } = use(params);
  const store = getStoreById(id);

  if (!store) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Store not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/settings">Back to Store List</Link>
        </Button>
      </div>
    );
  }

  return <StoreSettingsForm store={store} />;
}
