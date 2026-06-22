"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Mail,
  Megaphone,
  Plus,
  Sparkles,
  Tag,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  aiMarketingInsights,
  audiencesSeed,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  campaignsSeed,
  channelSendChart,
  conversionFunnel,
  couponsSeed,
  emailCampaignsSeed,
  formatBdt,
  journeysSeed,
  marketingKpis,
  type CampaignStatus,
  type MarketingTab,
} from "@/lib/mock-data/marketing";
import { flashSaleKpis } from "@/lib/mock-data/flash-sales";
import { promotionKpis } from "@/lib/mock-data/promotions";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";
import { usePromotionStore } from "@/lib/store/promotion-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MarketingNav } from "@/components/marketing/marketing-nav";

function campaignStatusVariant(status: CampaignStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

function DashboardTab() {
  const sales = useFlashSaleStore((s) => s.sales);
  const promotions = usePromotionStore((s) => s.promotions);
  const offerKpis = flashSaleKpis(sales);
  const promoKpis = promotionKpis(promotions);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-semibold">Flash Sales — scheduled product offers</h2>
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Single or multi-product time-boxed discounts. Scheduler syncs{" "}
              <code className="rounded bg-background px-1">special_price</code> at start/end — live
              on <code className="rounded bg-background px-1">/deals</code> and product pages.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" asChild>
            <Link href="/marketing/flash-sales">Manage flash sales →</Link>
          </Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {offerKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-md border border-input bg-background px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-sm font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold">Promotions — cart rule engine</h2>
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Auto discounts from cart subtotal, category, customer group, or product-in-cart rules.
              No coupon code — evaluated at checkout before coupons and loyalty.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" asChild>
            <Link href="/marketing/promotions">Manage promotions →</Link>
          </Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {promoKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-md border border-input bg-background px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-sm font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "Create campaign",
          "New segment",
          "Launch journey",
          "Issue coupon",
        ].map((label) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => toast.info(`${label} — prototype`)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {marketingKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p className={cn("text-xs", kpi.up ? "text-emerald-600" : "text-muted-foreground")}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-input bg-card p-3 lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium">Send volume by channel (7 days)</h2>
          <div className="h-44 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelSendChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="email" name="Email" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sms" name="SMS" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-medium">AI suggestions</h2>
          </div>
          <div className="space-y-2">
            {aiMarketingInsights.map((insight) => (
              <div key={insight.title} className="rounded-md border border-input bg-background px-3 py-2">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground">{insight.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Attribution funnel (7 days)</h2>
          <div className="space-y-2">
            {conversionFunnel.map((step, i) => (
              <div key={step.stage}>
                <div className="flex justify-between text-xs">
                  <span>{step.stage}</span>
                  <span className="font-medium">{step.count.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${(step.count / conversionFunnel[0].count) * 100}%`,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Running campaigns</h2>
          <div className="space-y-2">
            {campaignsSeed
              .filter((c) => c.status === "running")
              .map((c) => (
                <div key={c.id} className="rounded-md border border-input px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{c.name}</p>
                    <span className="text-xs font-medium text-emerald-600">{c.progress}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatBdt(c.revenue)} revenue · {c.goal}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsTab() {
  const [status, setStatus] = useState("all");
  const filtered = useMemo(
    () =>
      status === "all" ? campaignsSeed : campaignsSeed.filter((c) => c.status === status),
    [status],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[150px]">
          <option value="all">All status</option>
          {(Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]).map((s) => (
            <option key={s} value={s}>
              {CAMPAIGN_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("Create campaign — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create campaign
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-lg border border-input bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {c.code}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CAMPAIGN_TYPE_LABELS[c.type]} · {c.audience}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.channels.map((ch) => (
                    <Badge key={ch} variant="secondary" className="text-[10px]">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
              <Badge variant={campaignStatusVariant(c.status)} className="capitalize">
                {CAMPAIGN_STATUS_LABELS[c.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>{c.startsAt}{c.endsAt ? ` → ${c.endsAt}` : ""}</span>
              <span>Goal: {c.goal}</span>
              {c.revenue > 0 && <span className="font-medium text-foreground">{formatBdt(c.revenue)}</span>}
            </div>
            {c.progress > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AudiencesTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("New segment — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New segment
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {audiencesSeed.map((a) => (
          <div key={a.id} className="rounded-lg border border-input bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold">{a.name}</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold">{a.members.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">{a.growth}</p>
            <p className="mt-2 text-xs text-muted-foreground">Source: {a.source}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => toast.info(`Segment builder: ${a.name}`)}
            >
              Edit rules
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CouponsTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("Issue coupon — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Issue coupon
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-input">
        <table className="w-full text-sm">
          <thead className="border-b border-input bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Discount</th>
              <th className="px-3 py-2 font-medium">Redemptions</th>
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {couponsSeed.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono font-medium">{c.code}</td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.discount}</td>
                <td className="px-3 py-2">
                  {c.redemptions}
                  {c.limit ? ` / ${c.limit}` : ""}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {c.startsAt} → {c.endsAt}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant={
                      c.status === "active"
                        ? "success"
                        : c.status === "scheduled"
                          ? "warning"
                          : "muted"
                    }
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => toast.info("Templates — prototype")}>
          Templates
        </Button>
        <Button size="sm" onClick={() => toast.info("New email — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New email
        </Button>
      </div>
      {emailCampaignsSeed.map((e) => (
        <div key={e.id} className="rounded-lg border border-input bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-orange-600" />
              <div>
                <p className="font-medium">{e.subject}</p>
                <p className="text-xs text-muted-foreground">Template: {e.template}</p>
              </div>
            </div>
            <Badge variant={campaignStatusVariant(e.status)} className="capitalize">
              {CAMPAIGN_STATUS_LABELS[e.status]}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{e.recipients.toLocaleString()} recipients</span>
            {e.openRate > 0 && <span>Open {e.openRate}%</span>}
            {e.clickRate > 0 && <span>Click {e.clickRate}%</span>}
            <span>Scheduled {e.scheduledAt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneysTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("New journey — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New journey
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {journeysSeed.map((j) => (
          <div key={j.id} className="rounded-lg border border-input bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold">{j.name}</h3>
              </div>
              <Badge variant={j.status === "active" ? "success" : "secondary"} className="capitalize">
                {j.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Trigger: {j.trigger}</p>
            <p className="mt-2 text-xs">{j.steps} steps</p>
            {j.enrolled > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Completion</span>
                  <span>{Math.round((j.completed / j.enrolled) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(j.completed / j.enrolled) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {j.completed} / {j.enrolled} enrolled
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketingControlCenter() {
  const [tab, setTab] = useState<MarketingTab>("dashboard");
  const activeCampaigns = campaignsSeed.filter((c) => c.status === "running").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-orange-200 bg-orange-50/40 px-4 py-2.5 text-xs dark:border-orange-900/50 dark:bg-orange-950/20">
        <Megaphone className="h-4 w-4 shrink-0 text-orange-600" />
        <span>
          Marketing automation platform — campaigns, audiences, journeys, and coupons across
          email, SMS, and push. Audiences use Core contacts; attribution flows to CRM & Orders.
        </span>
      </div>

      <MarketingNav active={tab} onChange={setTab} activeCampaigns={activeCampaigns} />

      {tab === "dashboard" && <DashboardTab />}
      {tab === "campaigns" && <CampaignsTab />}
      {tab === "audiences" && <AudiencesTab />}
      {tab === "coupons" && <CouponsTab />}
      {tab === "email" && <EmailTab />}
      {tab === "journeys" && <JourneysTab />}
    </div>
  );
}
