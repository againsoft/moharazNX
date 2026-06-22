"use client";

import Link from "next/link";
import { Check, Minus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/store/admin-auth-store";

type Permission = {
  area: string;
  admin: boolean;
  staff: boolean;
  viewer: boolean;
};

const PERMISSIONS: Permission[] = [
  { area: "View dashboard & reports",       admin: true,  staff: true,  viewer: true  },
  { area: "Browse catalog & inventory",     admin: true,  staff: true,  viewer: true  },
  { area: "View orders & customers",        admin: true,  staff: true,  viewer: true  },
  { area: "Create & edit products",         admin: true,  staff: true,  viewer: false },
  { area: "Manage orders",                  admin: true,  staff: true,  viewer: false },
  { area: "Manage customers",               admin: true,  staff: true,  viewer: false },
  { area: "Manage inventory",               admin: true,  staff: true,  viewer: false },
  { area: "Upload & manage media",          admin: true,  staff: true,  viewer: false },
  { area: "Manage marketing & coupons",     admin: true,  staff: true,  viewer: false },
  { area: "Configure settings & plugins",   admin: true,  staff: false, viewer: false },
  { area: "Manage users & roles",           admin: true,  staff: false, viewer: false },
  { area: "Access AI settings",             admin: true,  staff: false, viewer: false },
];

const ROLES = [
  {
    key: "admin",
    label: "Admin",
    color: "default" as const,
    desc: "Full access to all features including settings and user management.",
  },
  {
    key: "staff",
    label: "Staff",
    color: "secondary" as const,
    desc: "Day-to-day operational access — products, orders, customers, media. No settings or user management.",
  },
  {
    key: "viewer",
    label: "Viewer",
    color: "outline" as const,
    desc: "Read-only access. Can browse all data but cannot create, edit, or delete anything.",
  },
];

function Cell({ allowed }: { allowed: boolean }) {
  if (allowed) return <Check className="mx-auto h-3.5 w-3.5 text-emerald-500" />;
  return <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground/40" />;
}

export default function SystemRolesPage() {
  const role = useAdminAuth((s) => s.user?.role);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Admin access required</p>
        <p className="mt-1">Only administrators can view role configuration.</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/system">Back to system hub</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="page-subtitle">
          <Link href="/system" className="hover:text-foreground">System</Link>
          {" › Access › User Roles"}
        </p>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600" />
          <h1 className="page-title">User Roles</h1>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Built-in roles and their permissions. Assign roles to users from{" "}
          <Link href="/system/users" className="underline underline-offset-2 hover:text-foreground">
            Team Users
          </Link>
          .
        </p>
      </div>

      {/* Role cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.key} className="rounded-xl border border-input bg-card p-4 shadow-sm">
            <Badge variant={r.color} className="mb-2 capitalize">{r.label}</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Permissions matrix */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Permissions Matrix
        </p>
        <div className="overflow-hidden rounded-lg border border-input">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Permission Area</th>
                <th className="px-3 py-2.5 text-center w-20">Admin</th>
                <th className="px-3 py-2.5 text-center w-20">Staff</th>
                <th className="px-3 py-2.5 text-center w-20">Viewer</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.area} className="border-t border-input/60 hover:bg-muted/20">
                  <td className="px-3 py-2">{p.area}</td>
                  <td className="px-3 py-2 text-center"><Cell allowed={p.admin} /></td>
                  <td className="px-3 py-2 text-center"><Cell allowed={p.staff} /></td>
                  <td className="px-3 py-2 text-center"><Cell allowed={p.viewer} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-input/60 px-3 py-2 text-[11px] text-muted-foreground">
            Roles are system-defined. To change a user's role go to{" "}
            <Link href="/system/users" className="underline underline-offset-2 hover:text-foreground">
              Team Users
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
