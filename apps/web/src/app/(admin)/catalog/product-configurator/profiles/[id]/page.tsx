"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import {
  PROFILE_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/configurator/types";
import { useConfiguratorProfile } from "@/lib/api/use-configurator-profiles";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";

export default function ConfiguratorProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile, loading, error } = useConfiguratorProfile(id);
  const canWrite = useAdminCanWrite();

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "configurator-profile-detail-api" });
  }, [error]);

  if (!loading && !profile && !error) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">Profile not found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/catalog/product-configurator/profiles">Back to profiles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="page-subtitle">
          <Link href="/catalog" className="hover:text-foreground">Catalog</Link>
          {" › "}
          <Link href="/catalog/product-configurator" className="hover:text-foreground">Product Configurator</Link>
          {" › "}
          <Link href="/catalog/product-configurator/profiles" className="hover:text-foreground">Profiles</Link>
          {profile ? ` › ${profile.name}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
            <Link href="/catalog/product-configurator/profiles">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          {profile && canWrite && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(`/catalog/product-configurator/profiles?edit=${profile.id}`)
              }
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
        <h1 className="page-title mt-2">{loading ? "Loading…" : profile?.name ?? "Profile"}</h1>
        <div className="mt-1.5">
          <ApiConnectionBadge loading={loading} error={error} productCount={profile ? 1 : 0} />
        </div>
      </div>

      {profile && (
        <div className="rounded-lg border border-input bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={profile.status === "active" ? "success" : profile.status === "draft" ? "warning" : "muted"}>
              {STATUS_LABELS[profile.status]}
            </Badge>
            <Badge variant="outline">{PROFILE_TYPE_LABELS[profile.profileType]}</Badge>
            {profile.isDefault && <Badge variant="outline">Default</Badge>}
          </div>

          {profile.description && (
            <p className="mt-3 text-sm text-muted-foreground">{profile.description}</p>
          )}

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Slug</dt>
              <dd className="text-sm">{profile.slug}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Categories</dt>
              <dd className="text-sm">{profile.categoryCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Rules</dt>
              <dd className="text-sm">{profile.ruleCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Templates</dt>
              <dd className="text-sm">{profile.templateCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Builds</dt>
              <dd className="text-sm">{profile.buildCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Updated</dt>
              <dd className="text-sm">{profile.updatedAt}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/catalog/product-configurator/categories">Manage categories</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/catalog/product-configurator/rules">Compatibility rules</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/catalog/product-configurator/templates">Templates</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
