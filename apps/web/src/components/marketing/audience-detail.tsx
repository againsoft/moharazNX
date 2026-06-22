"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import type { AudienceSegment } from "@/lib/mock-data/marketing";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  audience: AudienceSegment | null;
  loading?: boolean;
  error?: string | null;
  onUpdate?: (id: string, input: { name?: string; source?: string; growth?: string; members?: number }) => void;
};

export function AudienceDetail({
  audience,
  loading = false,
  error = null,
  onUpdate,
}: Props) {
  const canWrite = useAdminCanWrite();

  if (loading) {
    return (
      <div className="rounded-lg border border-input px-4 py-12 text-center text-sm text-muted-foreground">
        Loading audience…
      </div>
    );
  }

  if (error || !audience) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
        {error ?? "Audience not found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/marketing/audiences"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to audiences
      </Link>

      <div className="rounded-lg border border-input bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{audience.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Source: {audience.source}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Members</dt>
            <dd className="mt-0.5 text-2xl font-semibold">{audience.members.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Growth</dt>
            <dd className="mt-0.5 text-sm font-medium text-emerald-600">{audience.growth}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="mt-0.5 text-sm font-medium">{audience.source}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Last updated</dt>
            <dd className="mt-0.5 text-sm font-medium">{audience.updatedAt}</dd>
          </div>
        </dl>

        {canWrite && onUpdate && (
          <form
            className="mt-6 grid gap-3 border-t border-input pt-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onUpdate(audience.id, {
                name: String(fd.get("name") ?? audience.name),
                source: String(fd.get("source") ?? audience.source),
                growth: String(fd.get("growth") ?? audience.growth),
                members: Number(fd.get("members") ?? audience.members),
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={audience.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <Input id="source" name="source" defaultValue={audience.source} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="growth">Growth</Label>
              <Input id="growth" name="growth" defaultValue={audience.growth} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="members">Members</Label>
              <Input id="members" name="members" type="number" min={0} defaultValue={audience.members} />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
