"use client";

import { Gift, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  accountDashboard,
  rewardHistory,
} from "@/lib/mock-data/storefront-account";

const tierColors: Record<string, string> = {
  bronze: "bg-amber-700/15 text-amber-800 dark:text-amber-300",
  silver: "bg-slate-400/15 text-slate-700 dark:text-slate-300",
  gold: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-300",
  platinum: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
};

export function AccountRewardsView() {
  const dash = accountDashboard;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Rewards</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Points, tiers, and redemption history
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Available points</p>
            <p className="mt-1 text-3xl font-bold">{dash.rewardsPoints.toLocaleString()}</p>
          </div>
          <Badge className={tierColors[dash.rewardsTier]}>
            <Gift className="mr-1 h-3 w-3" />
            {dash.rewardsTierLabel}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {dash.pointsToNextTier} points to Gold tier
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, (dash.rewardsPoints / 1500) * 100)}%` }}
          />
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Points history</h3>
        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
          {rewardHistory.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{entry.label}</p>
                <p className="text-xs text-muted-foreground">{entry.date}</p>
              </div>
              <span
                className={
                  entry.points > 0
                    ? "font-semibold text-emerald-600"
                    : "font-semibold text-muted-foreground"
                }
              >
                {entry.points > 0 ? "+" : ""}
                {entry.points}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-lg border border-violet-200/60 bg-violet-50/50 p-4 text-sm dark:border-violet-900/40 dark:bg-violet-950/20">
        <p className="flex items-center gap-1.5 font-medium">
          <Sparkles className="h-4 w-4 text-violet-600" />
          Earn more points
        </p>
        <p className="mt-1 text-muted-foreground">
          Write verified reviews (+50 pts), refer friends (+200 pts), or complete your profile (+100 pts).
        </p>
      </div>
    </div>
  );
}
