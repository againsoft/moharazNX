"use client";

import { Plus, RefreshCw, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { domainsSeed, DOMAIN_STATUS_LABELS, type DomainStatus, type SslStatus } from "@/lib/mock-data/website";

const domainStatusColor: Record<DomainStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  verified: "text-blue-600 bg-blue-50 border-blue-200",
  active: "text-emerald-600 bg-emerald-50 border-emerald-200",
  error: "text-red-600 bg-red-50 border-red-200",
};

const sslStatusColor: Record<SslStatus, string> = {
  issued: "text-emerald-600 bg-emerald-50 border-emerald-200",
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  expired: "text-red-600 bg-red-50 border-red-200",
};

export function DomainManager() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Domain Manager</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Add and verify custom domains with SSL</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Domain
        </Button>
      </div>

      <WebsiteNav compact />

      {/* DNS instruction card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">To verify a domain, add this DNS TXT record:</p>
        <div className="mt-2 rounded-md bg-white/60 p-2 font-mono text-[12px] dark:bg-black/20">
          <span className="text-muted-foreground">Type:</span> TXT&nbsp;&nbsp;
          <span className="text-muted-foreground">Name:</span> _againerp-verify&nbsp;&nbsp;
          <span className="text-muted-foreground">Value:</span> verify-<span className="text-blue-600">your-token</span>&nbsp;&nbsp;
          <span className="text-muted-foreground">TTL:</span> 3600
        </div>
      </div>

      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Domain</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">SSL</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Primary</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Verified At</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {domainsSeed.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {d.isPrimary && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                    <p className="font-medium font-mono text-sm">{d.domain}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${domainStatusColor[d.status]}`}>
                    {DOMAIN_STATUS_LABELS[d.status]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${sslStatusColor[d.sslStatus]}`}>
                      {d.sslStatus.charAt(0).toUpperCase() + d.sslStatus.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {d.isPrimary && <span className="text-[11px] font-medium text-amber-600">Primary</span>}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden lg:table-cell">
                  {d.verifiedAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {d.status === "pending" && (
                      <Button size="sm" variant="outline" className="h-7 text-[11px]">
                        <RefreshCw className="mr-1 h-3 w-3" /> Verify Now
                      </Button>
                    )}
                    {d.status !== "pending" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Re-verify">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
