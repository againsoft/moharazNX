import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BarChart3,
  FileText,
  Image,
  LayoutDashboard,
  Layers,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export type WorkspaceNavItem = {
  id: string;
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: WorkspaceNavItem[];
};

export type WorkspaceNavGroup = {
  id: string;
  title: string;
  items: WorkspaceNavItem[];
};

/** MoharazNX — Ecommerce-only workspace navigation. */
export const workspaceNavGroups: WorkspaceNavGroup[] = [
  {
    id: "nav.ecommerce",
    title: "Ecommerce",
    items: [
      {
        id: "catalog",
        title: "Catalog",
        icon: Package,
        children: [
          { id: "catalog.products", title: "Products", href: "/catalog/products" },
          { id: "catalog.categories", title: "Categories", href: "/catalog/categories" },
          { id: "catalog.brands", title: "Brands", href: "/catalog/brands" },
          { id: "catalog.attributes", title: "Attributes", href: "/catalog/attributes" },
          { id: "catalog.variants", title: "Variants", href: "/catalog/variants" },
          { id: "catalog.filters", title: "Filters", href: "/catalog/filters" },
          { id: "catalog.collections", title: "Collections", href: "/catalog/collections" },
          { id: "catalog.bundles", title: "Bundles", href: "/catalog/bundles" },
          { id: "catalog.reviews", title: "Reviews", href: "/catalog/reviews" },
          { id: "catalog.qa", title: "Q&A", href: "/catalog/reviews/qa" },
        ],
      },
      {
        id: "inventory",
        title: "Inventory",
        icon: Warehouse,
        children: [
          { id: "inventory.dashboard", title: "Dashboard", href: "/inventory" },
          { id: "inventory.stock", title: "Stock Management", href: "/inventory/stock" },
          { id: "inventory.alerts", title: "Low Stock Alerts", href: "/inventory/alerts" },
          { id: "inventory.warehouses", title: "Warehouses", href: "/inventory/warehouses" },
          { id: "inventory.transfers", title: "Transfers", href: "/inventory/transfers" },
          { id: "inventory.adjustments", title: "Adjustments", href: "/inventory/adjustments" },
          { id: "inventory.purchase-orders", title: "Purchase Orders", href: "/inventory/purchase-orders" },
          { id: "inventory.batches", title: "Batch & Expiry", href: "/inventory/batches" },
        ],
      },
      {
        id: "sales",
        title: "Sales",
        icon: ShoppingCart,
        children: [
          { id: "sales.orders", title: "All Orders", href: "/orders/all" },
          { id: "sales.create", title: "Create Order", href: "/orders/create" },
          { id: "sales.shipments", title: "Shipments", href: "/orders/shipments" },
          { id: "sales.returns", title: "Returns", href: "/orders/returns" },
          { id: "sales.refunds", title: "Refunds", href: "/orders/refunds" },
          { id: "sales.payments", title: "Payments", href: "/orders/payments" },
          { id: "sales.abandoned", title: "Abandoned Carts", href: "/orders/abandoned-carts" },
          { id: "sales.reports", title: "Reports", href: "/orders/reports" },
        ],
      },
      {
        id: "customers",
        title: "Customers",
        icon: Users,
        children: [
          { id: "customers.all", title: "All Customers", href: "/customers/all" },
          { id: "customers.groups", title: "Customer Groups", href: "/customers/groups" },
          { id: "customers.segments", title: "Segments", href: "/customers/segments" },
          { id: "customers.loyalty", title: "Loyalty Program", href: "/customers/loyalty" },
          { id: "customers.rewards", title: "Rewards", href: "/customers/rewards" },
          { id: "customers.wallet", title: "Wallet", href: "/customers/wallet" },
          { id: "customers.wishlist", title: "Wishlists", href: "/customers/wishlists" },
          { id: "customers.support", title: "Support", href: "/customers/support" },
          { id: "customers.reports", title: "Reports", href: "/customers/reports" },
        ],
      },
      {
        id: "suppliers",
        title: "Suppliers",
        icon: Truck,
        children: [
          { id: "pur.suppliers", title: "All Suppliers", href: "/suppliers/all" },
          { id: "pur.po", title: "Purchase Orders", href: "/suppliers/purchase-orders" },
          { id: "pur.rfq", title: "RFQ", href: "/suppliers/rfq" },
          { id: "pur.quotes", title: "Quotations", href: "/suppliers/quotations" },
          { id: "pur.receipts", title: "Goods Receipts", href: "/suppliers/receipts" },
          { id: "pur.bills", title: "Vendor Bills", href: "/suppliers/bills" },
          { id: "pur.returns", title: "Returns", href: "/suppliers/returns" },
          { id: "pur.stock-feed", title: "Stock Feed", href: "/suppliers/stock-feed" },
        ],
      },
      {
        id: "marketing",
        title: "Marketing",
        icon: Megaphone,
        children: [
          { id: "mkt.coupons", title: "Coupons", href: "/marketing/promotions" },
          { id: "mkt.flash", title: "Flash Sales", href: "/marketing/flash-sales" },
          { id: "mkt.promo", title: "Promotions", href: "/marketing/promotions" },
          { id: "mkt.offers", title: "Special Offers", href: "/marketing/special-offers" },
          { id: "mkt.campaigns", title: "Campaigns", href: "/marketing/campaigns" },
          { id: "mkt.audiences", title: "Audiences", href: "/marketing/audiences" },
          { id: "mkt.journeys", title: "Journeys", href: "/marketing/journeys" },
          { id: "mkt.abandoned", title: "Abandoned Cart", href: "/orders/abandoned-carts" },
        ],
      },
      {
        id: "content",
        title: "Content",
        icon: FileText,
        children: [
          { id: "content.pages", title: "Pages", href: "/website/pages" },
          { id: "content.blog", title: "Blog Posts", href: "/website/blog/posts" },
          { id: "content.faq", title: "FAQs", href: "/website/faqs" },
          { id: "content.testimonials", title: "Testimonials", href: "/website/testimonials" },
          { id: "content.announcements", title: "Announcements", href: "/website/announcements" },
        ],
      },
      {
        id: "builder",
        title: "Builder",
        icon: Layers,
        children: [
          { id: "builder.theme", title: "Theme Manager", href: "/website/settings" },
          { id: "builder.home", title: "Homepage Builder", href: "/website/homepage" },
          { id: "builder.header", title: "Header Builder", href: "/website/header" },
          { id: "builder.footer", title: "Footer Builder", href: "/website/footer" },
          { id: "builder.menu", title: "Menu Builder", href: "/website/menus" },
          { id: "builder.landing", title: "Landing Pages", href: "/website/landing-pages" },
          { id: "builder.popup", title: "Popup Manager", href: "/website/popups" },
        ],
      },
      {
        id: "seo",
        title: "SEO",
        icon: Search,
        children: [
          { id: "seo.dashboard", title: "SEO Dashboard", href: "/seo" },
          { id: "seo.meta", title: "Meta Manager", href: "/seo/meta" },
          { id: "seo.urls", title: "URL Manager", href: "/seo/urls" },
          { id: "seo.redirects", title: "Redirects", href: "/seo/redirects" },
          { id: "seo.schema", title: "Schema Manager", href: "/seo/schema" },
          { id: "seo.sitemap", title: "Sitemap", href: "/seo/sitemap" },
          { id: "seo.robots", title: "Robots.txt", href: "/seo/robots" },
          { id: "seo.keywords", title: "Keyword Tracking", href: "/seo/keywords" },
          { id: "seo.audit", title: "SEO Audit", href: "/seo/audit" },
        ],
      },
      {
        id: "ai-tools",
        title: "AI Tools",
        icon: Sparkles,
        children: [
          { id: "ai.dashboard", title: "AI Dashboard", href: "/ai-os" },
          { id: "ai.description", title: "Product Description", href: "/ai-os/product-description" },
          { id: "ai.blog", title: "Blog Writer", href: "/ai-os/blog-writer" },
          { id: "ai.seo", title: "SEO Generator", href: "/ai-os/seo-generator" },
          { id: "ai.review", title: "Review Summary", href: "/ai-os/review-summary" },
          { id: "ai.image", title: "Image Generator", href: "/ai-os/image-generator" },
          { id: "ai.forecast", title: "Sales Forecast", href: "/ai-os/sales-forecast" },
          { id: "ai.inventory", title: "Inventory Forecast", href: "/ai-os/inventory-forecast" },
          { id: "ai.recommend", title: "Recommendations", href: "/ai-os/recommendations" },
        ],
      },
      {
        id: "media",
        title: "Media",
        icon: Image,
        children: [
          { id: "media.library", title: "Media Library", href: "/media" },
          { id: "media.images", title: "Images", href: "/media/images" },
          { id: "media.videos", title: "Videos", href: "/media/videos" },
          { id: "media.documents", title: "Documents", href: "/media/documents" },
          { id: "media.cdn", title: "CDN Manager", href: "/media/cdn" },
        ],
      },
      {
        id: "reports",
        title: "Reports",
        icon: BarChart3,
        children: [
          { id: "rpt.sales", title: "Sales Reports", href: "/reports/sales" },
          { id: "rpt.products", title: "Product Reports", href: "/reports/products" },
          { id: "rpt.customers", title: "Customer Reports", href: "/reports/customers" },
          { id: "rpt.inventory", title: "Inventory Reports", href: "/reports/inventory" },
          { id: "rpt.marketing", title: "Marketing Reports", href: "/reports/marketing" },
          { id: "rpt.returns", title: "Return Reports", href: "/reports/returns" },
          { id: "rpt.profit", title: "Profit Reports", href: "/reports/profit" },
          { id: "rpt.tax", title: "Tax Reports", href: "/reports/tax" },
          { id: "rpt.custom", title: "Custom Reports", href: "/reports/custom" },
        ],
      },
      {
        id: "system",
        title: "System",
        icon: Settings,
        children: [
          { id: "sys.general", title: "General Settings", href: "/settings/business" },
          { id: "sys.store", title: "Store Settings", href: "/settings" },
          { id: "sys.locale", title: "Localisation", href: "/settings/localisation" },
          { id: "sys.plugins", title: "Plugins", href: "/settings/plugins" },
          { id: "sys.payment", title: "Payment Gateways", href: "/settings/payments" },
          { id: "sys.shipping", title: "Shipping Methods", href: "/settings/shipping" },
          { id: "sys.email", title: "Email / SMS", href: "/settings/notifications" },
          {
            id: "sys.access",
            title: "Access",
            children: [
              { id: "sys.users", title: "Users", href: "/system/users" },
              { id: "sys.roles", title: "User Roles", href: "/system/roles" },
            ],
          },
          { id: "sys.ai", title: "AI Settings", href: "/settings/ai" },
        ],
      },
    ],
  },
  {
    id: "nav.platform",
    title: "Platform",
    items: [{ id: "ai-os", title: "AI OS", href: "/ai-os", icon: Bot }],
  },
];

export const workspaceHomeItem: WorkspaceNavItem = {
  id: "home",
  title: "Home",
  href: "/dashboard",
  icon: LayoutDashboard,
};

export const workspaceDashboardItem: WorkspaceNavItem = {
  id: "dashboard",
  title: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

export function flattenWorkspaceNav(): { title: string; href: string }[] {
  const items: { title: string; href: string }[] = [];
  const walk = (nodes: WorkspaceNavItem[], prefix: string) => {
    for (const node of nodes) {
      if (node.href) {
        items.push({
          title: prefix ? `${prefix} › ${node.title}` : node.title,
          href: node.href,
        });
      }
      if (node.children) walk(node.children, prefix ? `${prefix} › ${node.title}` : node.title);
    }
  };
  if (workspaceHomeItem.href) {
    items.push({ title: workspaceHomeItem.title, href: workspaceHomeItem.href });
  }
  for (const group of workspaceNavGroups) {
    walk(group.items, group.title);
  }
  return items;
}
