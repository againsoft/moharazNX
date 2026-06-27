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
  Shield,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  section?: string;
  children?: NavItem[];
};

/** MoharazNX — Ecommerce-only navigation (AgainERP ecommerce module). */
export const sidebarNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Control Center",
    href: "/center",
    icon: Shield,
    section: "PLATFORM",
  },

  {
    title: "Catalog",
    icon: Package,
    section: "ECOMMERCE",
    children: [
      { title: "Products", href: "/catalog/products" },
      { title: "Categories", href: "/catalog/categories" },
      { title: "Brands", href: "/catalog/brands" },
      { title: "Attributes", href: "/catalog/attributes" },
      { title: "Variants", href: "/catalog/variants" },
      { title: "Filters", href: "/catalog/filters" },
      { title: "Collections", href: "/catalog/collections" },
      { title: "Bundles", href: "/catalog/bundles" },
      {
        title: "Specifications",
        children: [
          { title: "Profiles", href: "/catalog/product-configurator/profiles" },
          { title: "Templates", href: "/catalog/product-configurator/templates" },
          { title: "AI Import", href: "/catalog/product-configurator/categories" },
        ],
      },
      {
        title: "Reviews",
        children: [
          { title: "All Reviews", href: "/catalog/reviews" },
          { title: "Q&A", href: "/catalog/reviews/qa" },
          { title: "AI Analysis", href: "/catalog/reviews/ai-analysis" },
        ],
      },
    ],
  },
  {
    title: "Inventory",
    icon: Warehouse,
    children: [
      { title: "Stock Management", href: "/inventory" },
      { title: "Low Stock Alerts", href: "/inventory/alerts" },
      { title: "Stock Adjustment", href: "/inventory/adjustments" },
      { title: "Stock Transfer", href: "/inventory/transfers" },
      { title: "Warehouses", href: "/inventory/warehouses" },
      { title: "Purchase Orders", href: "/inventory/purchase-orders" },
      { title: "Batch & Expiry", href: "/inventory/batches" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    children: [
      { title: "All Orders", href: "/orders/all" },
      { title: "Create Order", href: "/orders/create" },
      { title: "Shipments", href: "/orders/shipments" },
      { title: "Returns", href: "/orders/returns" },
      { title: "Refunds", href: "/orders/refunds" },
      { title: "Payments", href: "/orders/payments" },
      { title: "Abandoned Carts", href: "/orders/abandoned-carts" },
      { title: "Reports", href: "/orders/reports" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    children: [
      { title: "All Customers", href: "/customers/all" },
      { title: "Customer Groups", href: "/customers/groups" },
      { title: "Segments", href: "/customers/segments" },
      { title: "Loyalty Program", href: "/customers/loyalty" },
      { title: "Rewards", href: "/customers/rewards" },
      { title: "Wallet", href: "/customers/wallet" },
      { title: "Wishlists", href: "/customers/wishlists" },
      { title: "Support", href: "/customers/support" },
      { title: "Reports", href: "/customers/reports" },
    ],
  },
  {
    title: "Suppliers",
    icon: Truck,
    children: [
      { title: "All Suppliers", href: "/suppliers/all" },
      { title: "Purchase Orders", href: "/suppliers/purchase-orders" },
      { title: "RFQ", href: "/suppliers/rfq" },
      { title: "Quotations", href: "/suppliers/quotations" },
      { title: "Goods Receipts", href: "/suppliers/receipts" },
      { title: "Vendor Bills", href: "/suppliers/bills" },
      { title: "Returns", href: "/suppliers/returns" },
      { title: "Stock Feed", href: "/suppliers/stock-feed" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [
      { title: "Coupons", href: "/marketing/promotions" },
      { title: "Flash Sales", href: "/marketing/flash-sales" },
      { title: "Promotions", href: "/marketing/promotions" },
      { title: "Special Offers", href: "/marketing/special-offers" },
      { title: "Campaigns", href: "/marketing/campaigns" },
      { title: "Audiences", href: "/marketing/audiences" },
      { title: "Journeys", href: "/marketing/journeys" },
      { title: "Abandoned Cart", href: "/orders/abandoned-carts" },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    children: [
      { title: "Pages", href: "/website/pages" },
      { title: "Blog Posts", href: "/website/blog/posts" },
      { title: "Blog Categories", href: "/website/blog/categories" },
      { title: "FAQs", href: "/website/faqs" },
      { title: "Testimonials", href: "/website/testimonials" },
      { title: "Announcements", href: "/website/announcements" },
    ],
  },
  {
    title: "Builder",
    icon: Layers,
    children: [
      { title: "Theme Manager", href: "/website/settings" },
      { title: "Homepage Builder", href: "/website/homepage" },
      { title: "Header Builder", href: "/website/header" },
      { title: "Footer Builder", href: "/website/footer" },
      { title: "Menu Builder", href: "/website/menus" },
      { title: "Landing Pages", href: "/website/landing-pages" },
      { title: "Popup Manager", href: "/website/popups" },
    ],
  },
  {
    title: "SEO",
    icon: Search,
    children: [
      { title: "SEO Dashboard", href: "/seo" },
      { title: "Meta Manager", href: "/seo/meta" },
      { title: "URL Manager", href: "/seo/urls" },
      { title: "Redirects", href: "/seo/redirects" },
      { title: "Schema Manager", href: "/seo/schema" },
      { title: "Sitemap", href: "/seo/sitemap" },
      { title: "Robots.txt", href: "/seo/robots" },
      { title: "Keyword Tracking", href: "/seo/keywords" },
      { title: "SEO Audit", href: "/seo/audit" },
    ],
  },
  {
    title: "AI Tools",
    icon: Sparkles,
    children: [
      { title: "AI Dashboard", href: "/ai-os" },
      { title: "Product Description", href: "/ai-os/product-description" },
      { title: "Blog Writer", href: "/ai-os/blog-writer" },
      { title: "SEO Generator", href: "/ai-os/seo-generator" },
      { title: "Review Summary", href: "/ai-os/review-summary" },
      { title: "Image Generator", href: "/ai-os/image-generator" },
      { title: "Sales Forecast", href: "/ai-os/sales-forecast" },
      { title: "Inventory Forecast", href: "/ai-os/inventory-forecast" },
      { title: "Recommendations", href: "/ai-os/recommendations" },
    ],
  },
  {
    title: "Media",
    icon: Image,
    children: [
      { title: "Media Library", href: "/media" },
      { title: "Images", href: "/media/images" },
      { title: "Videos", href: "/media/videos" },
      { title: "Documents", href: "/media/documents" },
      { title: "CDN Manager", href: "/media/cdn" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    children: [
      { title: "Sales Reports", href: "/reports/sales" },
      { title: "Product Reports", href: "/reports/products" },
      { title: "Customer Reports", href: "/reports/customers" },
      { title: "Inventory Reports", href: "/reports/inventory" },
      { title: "Marketing Reports", href: "/reports/marketing" },
      { title: "Return Reports", href: "/reports/returns" },
      { title: "Profit Reports", href: "/reports/profit" },
      { title: "Tax Reports", href: "/reports/tax" },
      { title: "Custom Reports", href: "/reports/custom" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    section: "SYSTEM",
    children: [
      { title: "General Settings", href: "/settings/business" },
      { title: "Store Settings", href: "/settings" },
      { title: "Localisation", href: "/settings/localisation" },
      { title: "Plugins", href: "/settings/plugins" },
      { title: "Payment Gateways", href: "/settings/payments" },
      { title: "Shipping Methods", href: "/settings/shipping" },
      { title: "Email / SMS", href: "/settings/notifications" },
      {
        title: "Access",
        children: [
          { title: "Users", href: "/system/users" },
          { title: "User Roles", href: "/system/roles" },
        ],
      },
      { title: "AI Settings", href: "/settings/ai" },
    ],
  },
  {
    title: "AI OS",
    icon: Bot,
    href: "/ai-os",
  },
];

export const quickCreateItems = [
  { label: "Product", href: "/catalog/products?create=1" },
  { label: "Order", href: "/orders/create" },
  { label: "Customer", href: "/customers?create=1" },
  { label: "Category", href: "/catalog/categories?create=1" },
  { label: "Supplier PO", href: "/suppliers/purchase-orders/create" },
  { label: "Coupon", href: "/marketing/promotions?create=1" },
];

export const companies = [
  { id: "co1", name: "UrbanWear Retail" },
  { id: "co2", name: "TechGadgets BD" },
  { id: "co3", name: "Home & Living Co" },
];

export const branches = [
  { id: "br1", companyId: "co1", name: "Dhaka HQ" },
  { id: "br2", companyId: "co1", name: "Chittagong" },
  { id: "br3", companyId: "co2", name: "Main Warehouse" },
];
