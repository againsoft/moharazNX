export type ModuleNavTab = {
  id: string;
  label: string;
  href: string;
};

export type ModuleContext = {
  moduleId: string;
  moduleLabel: string;
  tabs: ModuleNavTab[];
};

const MODULE_TABS: Record<string, Omit<ModuleContext, "moduleId">> = {
  catalog: {
    moduleLabel: "Catalog",
    tabs: [
      { id: "WS-MODNAV-DASH", label: "Products", href: "/catalog/products" },
      { id: "WS-MODNAV-OPS", label: "Categories", href: "/catalog/categories" },
      { id: "WS-MODNAV-OPS", label: "Brands", href: "/catalog/brands" },
      { id: "WS-MODNAV-RPT", label: "Reports", href: "/reports/products" },
    ],
  },
  inventory: {
    moduleLabel: "Inventory",
    tabs: [
      { id: "WS-MODNAV-DASH", label: "Dashboard", href: "/inventory" },
      { id: "WS-MODNAV-OPS", label: "Stock", href: "/inventory/stock" },
      { id: "WS-MODNAV-RPT", label: "Reports", href: "/reports/inventory" },
    ],
  },
  orders: {
    moduleLabel: "Orders",
    tabs: [
      { id: "WS-MODNAV-DASH", label: "All Orders", href: "/orders/all" },
      { id: "WS-MODNAV-OPS", label: "Returns", href: "/orders/returns" },
      { id: "WS-MODNAV-RPT", label: "Reports", href: "/orders/reports" },
    ],
  },
  website: {
    moduleLabel: "Website",
    tabs: [
      { id: "WS-MODNAV-DASH", label: "Dashboard", href: "/website/dashboard" },
      { id: "WS-MODNAV-OPS", label: "Pages", href: "/website/pages" },
      { id: "WS-MODNAV-OPS", label: "Blog", href: "/website/blog/posts" },
      { id: "WS-MODNAV-SET", label: "Settings", href: "/website/settings" },
    ],
  },
  seo: {
    moduleLabel: "SEO",
    tabs: [
      { id: "WS-MODNAV-DASH", label: "Dashboard", href: "/seo" },
      { id: "WS-MODNAV-OPS", label: "Meta", href: "/seo/meta" },
      { id: "WS-MODNAV-OPS", label: "URLs", href: "/seo/urls" },
    ],
  },
};

export function resolveModuleContext(pathname: string): ModuleContext | null {
  if (pathname.startsWith("/catalog")) {
    return { moduleId: "catalog", ...MODULE_TABS.catalog };
  }
  if (pathname.startsWith("/inventory")) {
    return { moduleId: "inventory", ...MODULE_TABS.inventory };
  }
  if (pathname.startsWith("/orders")) {
    return { moduleId: "orders", ...MODULE_TABS.orders };
  }
  if (pathname.startsWith("/website")) {
    return { moduleId: "website", ...MODULE_TABS.website };
  }
  if (pathname.startsWith("/seo")) {
    return { moduleId: "seo", ...MODULE_TABS.seo };
  }
  return null;
}

export function isModuleNavTabActive(pathname: string, href: string): boolean {
  const base = href.split("?")[0];
  if (base === pathname) return true;
  if (pathname.startsWith(base + "/")) return true;
  return false;
}
