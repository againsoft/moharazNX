import { sidebarNav } from "@/lib/navigation";
import { BRAND_NAME } from "@/lib/brand";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function flattenSidebarNav() {
  const out: { title: string; href: string; path: string[] }[] = [];
  const walk = (nodes: typeof sidebarNav, parents: string[]) => {
    for (const node of nodes) {
      const path = [...parents, node.title];
      if (node.href) {
        out.push({ title: node.title, href: node.href, path });
      }
      if (node.children) walk(node.children, path);
    }
  };
  walk(sidebarNav, []);
  return out;
}

const SIDEBAR_FLAT = flattenSidebarNav();

const SEGMENT_LABELS: Record<string, string> = {
  catalog: "Catalog",
  customers: "Customers",
  orders: "Orders",
  inventory: "Inventory",
  suppliers: "Suppliers",
  marketing: "Marketing",
  website: "Website",
  seo: "SEO",
  media: "Media",
  reports: "Reports",
  settings: "Settings",
  notifications: "Notifications",
  dashboard: "Dashboard",
  "ai-os": "AI OS",
};

function normalizeHref(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

function findNavMatch(pathname: string, search: string) {
  const full = normalizeHref(pathname, search);
  const exact = SIDEBAR_FLAT.find((e) => e.href === full);
  if (exact) return exact;

  const pathMatches = SIDEBAR_FLAT.filter((e) => {
    const [path] = e.href.split("?");
    return pathname === path || pathname.startsWith(`${path}/`);
  }).sort((a, b) => b.href.length - a.href.length);

  return pathMatches[0];
}

function fallbackCrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs: BreadcrumbItem[] = [];
  let href = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    href += `/${segment}`;
    const label =
      SEGMENT_LABELS[segment] ??
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = i === segments.length - 1;
    crumbs.push({ label, href: isLast ? undefined : href });
  }

  return crumbs;
}

export function resolveBreadcrumbs(pathname: string, search = ""): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: BRAND_NAME, href: "/dashboard" }];

  if (pathname === "/dashboard") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }

  const match = findNavMatch(pathname, search);

  if (match) {
    match.path.forEach((label, index) => {
      const isLast = index === match.path.length - 1;
      crumbs.push({
        label,
        href: isLast ? undefined : match.href.split("?")[0],
      });
    });
    return crumbs;
  }

  const fallback = fallbackCrumbs(pathname);
  return [...crumbs, ...fallback];
}
