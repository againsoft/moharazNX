import type { CloudflarePlugin } from "@/lib/api/cloudflare-plugin";

export function isCloudflarePluginActive(plugin: CloudflarePlugin | null | undefined): boolean {
  return Boolean(plugin?.installed && plugin.enabled);
}

export function isCloudflareAccountVerified(plugin: CloudflarePlugin | null | undefined): boolean {
  return Boolean(plugin?.installed && plugin.accountStatus === "connected");
}

export function canUseCloudflareR2Storage(plugin: CloudflarePlugin | null | undefined): boolean {
  return Boolean(
    isCloudflareAccountVerified(plugin) &&
      plugin?.r2Status === "connected" &&
      plugin.mediaStorage === "r2",
  );
}

export function cloudflareStorageLabel(plugin: CloudflarePlugin | null | undefined): string {
  if (!isCloudflarePluginActive(plugin)) return "Local storage";
  if (canUseCloudflareR2Storage(plugin)) return "Cloudflare R2";
  return "Local storage";
}
