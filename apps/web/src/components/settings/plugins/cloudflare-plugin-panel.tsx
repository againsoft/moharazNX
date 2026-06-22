"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cloud, HardDrive, ImageIcon, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateCloudflarePlugin,
  useCloudflarePlugin,
} from "@/lib/api/use-cloudflare-plugin";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { isCloudflareAccountVerified } from "@/lib/plugins/cloudflare";
import { CloudflareConnectButton } from "@/components/settings/plugins/cloudflare-connect-button";
import { usePluginsStore } from "@/lib/store/plugins-store";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SectionId = "account" | "media" | "r2" | "images";

type Props = {
  activeSection: SectionId;
};

function statusBadge(status: string) {
  if (status === "connected") return <Badge variant="success">Connected</Badge>;
  if (status === "error") return <Badge variant="warning">Error</Badge>;
  return <Badge variant="muted">Disconnected</Badge>;
}

export function CloudflarePluginPanel({ activeSection }: Props) {
  const canWrite = useAdminCanWrite();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plugin, loading, error, refetch } = useCloudflarePlugin();
  const [saving, setSaving] = useState<string | null>(null);
  const [draftToken, setDraftToken] = useState("");
  const [draftR2Secret, setDraftR2Secret] = useState("");
  const [draftImagesToken, setDraftImagesToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [r2Bucket, setR2Bucket] = useState("");
  const [r2AccessKeyId, setR2AccessKeyId] = useState("");
  const [r2PublicBaseUrl, setR2PublicBaseUrl] = useState("");
  const [imagesAccountHash, setImagesAccountHash] = useState("");
  const [mediaStorage, setMediaStorage] = useState<"local" | "r2">("local");

  const verified = isCloudflareAccountVerified(plugin);

  useEffect(() => {
    if (!plugin) return;
    setAccountId(plugin.accountId);
    setR2Bucket(plugin.r2Bucket);
    setR2AccessKeyId(plugin.r2AccessKeySet ? "********" : "");
    setR2PublicBaseUrl(plugin.r2PublicBaseUrl);
    setImagesAccountHash(plugin.imagesAccountHash);
    setMediaStorage(plugin.mediaStorage);
  }, [plugin]);

  useEffect(() => {
    const oauth = searchParams.get("oauth");
    if (!oauth) return;
    if (oauth === "success") {
      usePluginsStore.getState().installPlugin("cloudflare");
      toast.success("Cloudflare connected successfully");
      void refetch();
    } else if (oauth === "error") {
      const message = searchParams.get("message") ?? "Cloudflare connection failed";
      toast.error(decodeURIComponent(message.replace(/\+/g, " ")));
    }
    router.replace("/settings/plugins/cloudflare");
  }, [searchParams, router, refetch]);

  const handleSave = async (
    action: "account" | "r2" | "images" | "media",
    verify: boolean,
  ) => {
    if (!canWrite) return;
    setSaving(action);
    try {
      if (action === "account") {
        await updateCloudflarePlugin({
          accountId,
          apiToken: draftToken || undefined,
          verifyAccount: verify,
        });
        setDraftToken("");
      } else if (action === "r2") {
        await updateCloudflarePlugin({
          r2Bucket,
          r2AccessKeyId: r2AccessKeyId === "********" ? undefined : r2AccessKeyId,
          r2SecretAccessKey: draftR2Secret || undefined,
          r2PublicBaseUrl,
          verifyR2: verify,
        });
        setDraftR2Secret("");
      } else if (action === "images") {
        await updateCloudflarePlugin({
          imagesAccountHash,
          imagesApiToken: draftImagesToken || undefined,
          verifyImages: verify,
        });
        setDraftImagesToken("");
      } else {
        await updateCloudflarePlugin({ mediaStorage });
      }
      await refetch();
      toast.success(verify ? "Verified and saved" : "Configuration saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading Cloudflare settings…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">API: {error}</p>;
  }

  if (!plugin) return null;

  if (activeSection === "account") {
    return (
      <div className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
        <div className="border-b border-input bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Account Verification</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Cloudflare API token ও Account ID দিয়ে verify করুন। Verify না হলে অন্য service চালু হবে না।
              </p>
            </div>
            <ApiConnectionBadge
              loading={false}
              error={null}
              productCount={plugin.accountStatus === "connected" ? 1 : 0}
            />
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
            <p className="text-sm font-medium">Connect with Cloudflare</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Cloudflare login দিয়ে এক ক্লিকে account connect করুন। Authorize করার পর account auto-verify হবে।
            </p>
            <CloudflareConnectButton
              className="mt-3"
              disabled={!canWrite}
              ensureInstalled={false}
              connected={plugin.accountStatus === "connected"}
              oauthAvailable={plugin.oauthAvailable}
            />
            {plugin.accountStatus === "connected" && plugin.authMethod === "oauth" && (
              <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                Connected via OAuth{plugin.accountName ? ` · ${plugin.accountName}` : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or manual API token</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Cloud className="h-4 w-4 text-orange-500" />
            <span className="font-medium">Cloudflare Account</span>
            {statusBadge(plugin.accountStatus)}
            {plugin.apiTokenHint && (
              <span className="text-muted-foreground">Token {plugin.apiTokenHint}</span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cf-account-id">Account ID</Label>
              <Input
                id="cf-account-id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Cloudflare Account ID"
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-api-token">API Token</Label>
              <Input
                id="cf-api-token"
                type="password"
                value={draftToken}
                onChange={(e) => setDraftToken(e.target.value)}
                placeholder={plugin.apiTokenSet ? "•••••••• (leave blank to keep)" : "Create token with R2 + Account read"}
                disabled={!canWrite}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canWrite || saving === "account"}
              onClick={() => void handleSave("account", false)}
            >
              {saving === "account" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Save
            </Button>
            <Button
              size="sm"
              disabled={!canWrite || saving === "account"}
              onClick={() => void handleSave("account", true)}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Verify &amp; Connect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="rounded-xl border border-dashed border-input bg-muted/20 p-6 text-center">
        <p className="text-sm font-medium">Account verification required</p>
        <p className="mt-1 text-xs text-muted-foreground">
          আগে <strong>Account Verification</strong> section-এ API token verify করুন। তারপর R2, Images ও media storage option দেখা যাবে।
        </p>
      </div>
    );
  }

  if (activeSection === "media") {
    return (
      <div className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
        <div className="border-b border-input bg-muted/30 px-4 py-3">
          <p className="text-sm font-semibold">Media Storage</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Image ও media file কোথায় save হবে — local server নাকি Cloudflare R2।
          </p>
        </div>
        <div className="space-y-3 p-4">
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mediaStorage === "local" ? "border-primary bg-primary/5" : "border-input",
            )}
          >
            <input
              type="radio"
              name="media-storage"
              checked={mediaStorage === "local"}
              onChange={() => setMediaStorage("local")}
              disabled={!canWrite}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4" />
                Local storage
              </div>
              <p className="text-[11px] text-muted-foreground">
                Files save to API server disk (`/uploads/media/`).
              </p>
            </div>
          </label>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mediaStorage === "r2" ? "border-primary bg-primary/5" : "border-input",
              plugin.r2Status !== "connected" && "opacity-60",
            )}
          >
            <input
              type="radio"
              name="media-storage"
              checked={mediaStorage === "r2"}
              onChange={() => setMediaStorage("r2")}
              disabled={!canWrite || plugin.r2Status !== "connected"}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Cloud className="h-4 w-4 text-orange-500" />
                Cloudflare R2
                {plugin.r2Status !== "connected" && (
                  <Badge variant="muted">Connect R2 first</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                New uploads go to your R2 bucket via CDN URL.
              </p>
            </div>
          </label>
          <Button
            size="sm"
            disabled={!canWrite || saving === "media"}
            onClick={() => void handleSave("media", false)}
          >
            {saving === "media" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save storage preference
          </Button>
        </div>
      </div>
    );
  }

  if (activeSection === "r2") {
    return (
      <div className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
        <div className="border-b border-input bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">R2 Object Storage</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Bucket, access keys, এবং public CDN URL configure করুন।
              </p>
            </div>
            {statusBadge(plugin.r2Status)}
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-r2-bucket">Bucket name</Label>
            <Input
              id="cf-r2-bucket"
              value={r2Bucket}
              onChange={(e) => setR2Bucket(e.target.value)}
              placeholder="moharaznx-media"
              disabled={!canWrite}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-r2-key">Access Key ID</Label>
            <Input
              id="cf-r2-key"
              value={r2AccessKeyId}
              onChange={(e) => setR2AccessKeyId(e.target.value)}
              placeholder="R2 access key"
              disabled={!canWrite}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-r2-secret">Secret Access Key</Label>
            <Input
              id="cf-r2-secret"
              type="password"
              value={draftR2Secret}
              onChange={(e) => setDraftR2Secret(e.target.value)}
              placeholder="R2 secret key"
              disabled={!canWrite}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-r2-cdn">Public CDN base URL</Label>
            <Input
              id="cf-r2-cdn"
              value={r2PublicBaseUrl}
              onChange={(e) => setR2PublicBaseUrl(e.target.value)}
              placeholder="https://cdn.yourdomain.com"
              disabled={!canWrite}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-input px-4 py-3">
          <Button
            size="sm"
            variant="outline"
            disabled={!canWrite || saving === "r2"}
            onClick={() => void handleSave("r2", false)}
          >
            Save
          </Button>
          <Button
            size="sm"
            disabled={!canWrite || saving === "r2"}
            onClick={() => void handleSave("r2", true)}
          >
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            Verify R2 Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
      <div className="border-b border-input bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Cloudflare Images</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Optional image optimization API — account hash ও dedicated token।
            </p>
          </div>
          {statusBadge(plugin.imagesStatus)}
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cf-images-hash">Account hash</Label>
          <Input
            id="cf-images-hash"
            value={imagesAccountHash}
            onChange={(e) => setImagesAccountHash(e.target.value)}
            placeholder="Images delivery account hash"
            disabled={!canWrite}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cf-images-token">Images API token</Label>
          <Input
            id="cf-images-token"
            type="password"
            value={draftImagesToken}
            onChange={(e) => setDraftImagesToken(e.target.value)}
            placeholder={plugin.imagesApiTokenSet ? "Leave blank to keep current" : "Images API token"}
            disabled={!canWrite}
          />
          {plugin.imagesApiTokenHint && (
            <p className="text-[10px] text-muted-foreground">Current: {plugin.imagesApiTokenHint}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-input px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          disabled={!canWrite || saving === "images"}
          onClick={() => void handleSave("images", false)}
        >
          Save
        </Button>
        <Button
          size="sm"
          disabled={!canWrite || saving === "images"}
          onClick={() => void handleSave("images", true)}
        >
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
          Verify Images API
        </Button>
      </div>
    </div>
  );
}
