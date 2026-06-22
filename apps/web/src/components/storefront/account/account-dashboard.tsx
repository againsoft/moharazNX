"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Gift,
  Package,
  RotateCcw,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  accountDashboard,
  accountOrders,
} from "@/lib/mock-data/storefront-account";
import { accountPaths } from "@/lib/url-slug/storefront-paths";
import { formatCurrency } from "@/lib/utils";

export function AccountDashboard() {
  const recentOrders = accountOrders.slice(0, 2);
  const dash = accountDashboard;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent activity, rewards, and quick actions
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href={accountPaths.rewards}
          className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gift className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-medium">Rewards</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{dash.rewardsPoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{dash.rewardsTierLabel}</p>
        </Link>
        <Link
          href={accountPaths.wallet}
          className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium">Wallet</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(dash.walletBalance)}</p>
          <p className="text-xs text-muted-foreground">Store credit</p>
        </Link>
        <Link
          href={accountPaths.orders}
          className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Orders</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{accountOrders.length}</p>
          <p className="text-xs text-muted-foreground">All time</p>
        </Link>
        <Link
          href={accountPaths.reviews}
          className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">Reviews</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{dash.pendingReviews}</p>
          <p className="text-xs text-muted-foreground">Pending review</p>
        </Link>
      </div>

      <section className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/20 sm:p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-semibold">Picked for you</h3>
          <Badge variant="secondary" className="text-[10px]">AI tips</Badge>
        </div>
        <ul className="mt-3 space-y-2">
          {dash.aiTips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Recent orders</h3>
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href={accountPaths.orders}>
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.placedAt}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {order.statusLabel}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {order.items.slice(0, 3).map((item) => (
                  <div
                    key={item.slug}
                    className="relative h-10 w-10 overflow-hidden rounded-md bg-muted"
                  >
                    <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                ))}
                <span className="text-sm text-muted-foreground">
                  {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {formatCurrency(order.total)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.canTrack && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link href={`${accountPaths.orders}?track=${order.orderNumber}`}>Track</Link>
                  </Button>
                )}
                {order.canReorder && (
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Reorder
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={accountPaths.returns}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:bg-accent/50"
        >
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Returns & refunds</p>
            <p className="text-xs text-muted-foreground">Request RMA for delivered orders</p>
          </div>
        </Link>
        <Link
          href={accountPaths.support}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:bg-accent/50"
        >
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Need help?</p>
            <p className="text-xs text-muted-foreground">
              {dash.openTickets} open ticket{dash.openTickets !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
