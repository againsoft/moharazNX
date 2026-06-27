import type { SettingCategoryDef, SettingItemDef, SettingsLayer } from "@/lib/settings/types";

export const BUSINESS_SETTINGS_CATEGORIES: SettingCategoryDef[] = [
  {
    id: "store",
    title: "Store",
    description: "Store identity and business information",
    sections: [
      {
        id: "identity",
        title: "Store Identity",
        groups: [
          {
            id: "general",
            title: "General",
            items: [
              { key: "store.name", label: "Store Name", type: "text", defaultValue: "MoharazNX Commerce" },
              { key: "store.email", label: "Email", type: "text", defaultValue: "sales@again.com.bd" },
              { key: "store.phone", label: "Phone", type: "text", defaultValue: "+880 9612-345678" },
              { key: "store.address", label: "Address", type: "textarea", defaultValue: "House 12, Road 5, Dhanmondi, Dhaka" },
              { key: "store.hours", label: "Business Hours", type: "text", defaultValue: "Sat–Thu 10:00–20:00" },
            ],
          },
          {
            id: "branding",
            title: "Branding",
            items: [
              { key: "store.logo", label: "Logo URL", type: "text", defaultValue: "/brand/logo.svg" },
              { key: "store.favicon", label: "Favicon URL", type: "text", defaultValue: "/favicon.ico" },
            ],
          },
          {
            id: "numbering",
            title: "Document Numbering",
            items: [
              { key: "store.invoice_prefix", label: "Invoice Prefix", type: "text", defaultValue: "INV" },
              { key: "store.order_prefix", label: "Order Prefix", type: "text", defaultValue: "ORD" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catalog",
    title: "Catalog",
    description: "Catalog and product behavior",
    sections: [
      {
        id: "general",
        title: "General",
        groups: [
          {
            id: "products",
            title: "Products",
            items: [
              { key: "catalog.approval_required", label: "Product Approval Required", type: "toggle", defaultValue: false },
              {
                key: "catalog.default_status",
                label: "Default Product Status",
                type: "select",
                defaultValue: "draft",
                options: [
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                ],
              },
              { key: "catalog.sku_auto", label: "SKU Generation", type: "toggle", defaultValue: true },
              { key: "catalog.barcode_auto", label: "Barcode Generation", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
      {
        id: "reviews",
        title: "Reviews",
        groups: [
          {
            id: "review_rules",
            title: "Review Rules",
            items: [
              { key: "catalog.reviews_enabled", label: "Enable Reviews", type: "toggle", defaultValue: true },
              { key: "catalog.review_approval", label: "Review Approval", type: "toggle", defaultValue: true },
              { key: "catalog.verified_only", label: "Verified Purchase Reviews", type: "toggle", defaultValue: false },
            ],
          },
        ],
      },
      {
        id: "inventory",
        title: "Inventory Rules",
        groups: [
          {
            id: "stock",
            title: "Stock Control",
            items: [
              { key: "catalog.allow_backorders", label: "Allow Backorders", type: "toggle", defaultValue: false },
              { key: "catalog.show_oos", label: "Show Out of Stock Products", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    description: "Customer registration and engagement",
    sections: [
      {
        id: "registration",
        title: "Registration",
        groups: [
          {
            id: "signup",
            title: "Sign Up",
            items: [
              { key: "customers.registration", label: "Customer Registration", type: "toggle", defaultValue: true },
              { key: "customers.guest_checkout", label: "Guest Checkout", type: "toggle", defaultValue: true },
              { key: "customers.email_verify", label: "Email Verification", type: "toggle", defaultValue: false },
              { key: "customers.phone_verify", label: "Phone Verification", type: "toggle", defaultValue: true },
            ],
          },
          {
            id: "engagement",
            title: "Engagement",
            items: [
              { key: "customers.reward_points", label: "Reward Points", type: "toggle", defaultValue: true },
              { key: "customers.wallet", label: "Wallet System", type: "toggle", defaultValue: true },
              { key: "customers.wishlist", label: "Wishlist", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    description: "Order workflow and fulfillment rules",
    sections: [
      {
        id: "workflow",
        title: "Order Workflow",
        groups: [
          {
            id: "automation",
            title: "Automation",
            items: [
              {
                key: "orders.workflow",
                label: "Order Workflow",
                type: "select",
                defaultValue: "standard",
                options: [
                  { label: "Standard", value: "standard" },
                  { label: "Express", value: "express" },
                  { label: "B2B Approval", value: "b2b" },
                ],
              },
              { key: "orders.auto_confirm", label: "Auto Confirmation", type: "toggle", defaultValue: false },
              { key: "orders.auto_complete", label: "Auto Completion", type: "toggle", defaultValue: false },
            ],
          },
          {
            id: "returns",
            title: "Returns & Refunds",
            items: [
              { key: "orders.return_days", label: "Return Window (days)", type: "number", defaultValue: 7 },
              { key: "orders.refund_auto", label: "Auto Refund on Return", type: "toggle", defaultValue: false },
              { key: "orders.invoice_auto", label: "Auto Generate Invoice", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "checkout",
    title: "Checkout",
    description: "Checkout experience and rules",
    sections: [
      {
        id: "experience",
        title: "Checkout Experience",
        groups: [
          {
            id: "flow",
            title: "Flow",
            items: [
              { key: "checkout.one_page", label: "One Page Checkout", type: "toggle", defaultValue: true },
              { key: "checkout.guest", label: "Guest Checkout", type: "toggle", defaultValue: true },
              { key: "checkout.coupon", label: "Coupon Support", type: "toggle", defaultValue: true },
              { key: "checkout.terms", label: "Terms Agreement Required", type: "toggle", defaultValue: true },
            ],
          },
          {
            id: "limits",
            title: "Order Limits",
            items: [
              { key: "checkout.min_amount", label: "Minimum Order Amount", type: "number", defaultValue: 500 },
              { key: "checkout.max_amount", label: "Maximum Order Amount", type: "number", defaultValue: 500000 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    description: "Payment methods and verification",
    sections: [
      {
        id: "methods",
        title: "Payment Methods",
        groups: [
          {
            id: "enabled",
            title: "Enabled Methods",
            items: [
              { key: "payments.cod", label: "Cash On Delivery", type: "toggle", defaultValue: true },
              { key: "payments.online", label: "Online Payment", type: "toggle", defaultValue: true },
              { key: "payments.bank", label: "Bank Transfer", type: "toggle", defaultValue: true },
              { key: "payments.partial", label: "Partial Payment", type: "toggle", defaultValue: false },
            ],
          },
          {
            id: "verification",
            title: "Verification",
            items: [
              { key: "payments.verify_cod", label: "COD Phone Verification", type: "toggle", defaultValue: true },
              { key: "payments.verify_online", label: "Online Payment Auto-Verify", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    description: "Shipping zones and delivery",
    sections: [
      {
        id: "delivery",
        title: "Delivery",
        groups: [
          {
            id: "rules",
            title: "Shipping Rules",
            items: [
              { key: "shipping.free_threshold", label: "Free Shipping Above (BDT)", type: "number", defaultValue: 2000 },
              { key: "shipping.default_method", label: "Default Method", type: "select", defaultValue: "standard", options: [
                { label: "Standard", value: "standard" },
                { label: "Express", value: "express" },
                { label: "Same Day", value: "same_day" },
              ]},
              { key: "shipping.time_slots", label: "Delivery Time Slots", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Coupons, loyalty, and recovery",
    sections: [
      {
        id: "programs",
        title: "Programs",
        groups: [
          {
            id: "promo",
            title: "Promotions",
            items: [
              { key: "marketing.coupons", label: "Coupons", type: "toggle", defaultValue: true },
              { key: "marketing.referral", label: "Referral Program", type: "toggle", defaultValue: false },
              { key: "marketing.loyalty", label: "Loyalty Program", type: "toggle", defaultValue: true },
              { key: "marketing.abandoned_cart", label: "Abandoned Cart Recovery", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    description: "Search engine optimization",
    sections: [
      {
        id: "technical",
        title: "Technical SEO",
        groups: [
          {
            id: "urls",
            title: "URLs & Meta",
            items: [
              { key: "seo.clean_urls", label: "SEO URLs", type: "toggle", defaultValue: true },
              { key: "seo.meta_templates", label: "Meta Templates", type: "toggle", defaultValue: true },
              { key: "seo.sitemap", label: "Sitemap Auto-Generate", type: "toggle", defaultValue: true },
              { key: "seo.schema", label: "Schema Markup", type: "toggle", defaultValue: true },
              { key: "seo.robots", label: "Robots.txt Management", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email, SMS, and in-app alerts",
    sections: [
      {
        id: "alerts",
        title: "Alert Rules",
        groups: [
          {
            id: "channels",
            title: "Notification Channels",
            items: [
              { key: "notify.order", label: "Order Notifications", type: "toggle", defaultValue: true },
              { key: "notify.customer", label: "Customer Notifications", type: "toggle", defaultValue: true },
              { key: "notify.review", label: "Review Notifications", type: "toggle", defaultValue: true },
              { key: "notify.low_stock", label: "Low Stock Notifications", type: "toggle", defaultValue: true },
            ],
          },
        ],
      },
    ],
  },
];

export const WORKSPACE_SETTINGS_CATEGORIES: SettingCategoryDef[] = [
  { id: "users", title: "Users", description: "User management, invitations, status control", sections: [{ id: "main", title: "Users", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.users.invite", label: "Allow User Invitations", type: "toggle", defaultValue: true },
    { key: "workspace.users.sso", label: "SSO Enabled", type: "toggle", defaultValue: false },
  ]}]}]},
  { id: "roles", title: "Roles", description: "Role creation and permission assignment", sections: [{ id: "main", title: "Roles", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.roles.custom", label: "Custom Roles Allowed", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "teams", title: "Teams", description: "Team structure and assignment", sections: [{ id: "main", title: "Teams", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.teams.enabled", label: "Enable Teams", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "branches", title: "Branches", description: "Multi-branch management", sections: [{ id: "main", title: "Branches", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.branches.multi", label: "Multi-Branch Mode", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "warehouses", title: "Warehouses", description: "Warehouse configuration and transfers", sections: [{ id: "main", title: "Warehouses", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.wh.auto_transfer", label: "Auto Transfer Rules", type: "toggle", defaultValue: false },
  ]}]}]},
  { id: "integrations", title: "Integrations", description: "Payment, shipping, and external services", sections: [{ id: "main", title: "Integrations", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.int.webhooks", label: "Outbound Webhooks", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "workflows", title: "Workflows", description: "Workflow definitions and triggers", sections: [{ id: "main", title: "Workflows", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.wf.engine", label: "Workflow Engine", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "approvals", title: "Approvals", description: "Approval policies and delegation", sections: [{ id: "main", title: "Approvals", groups: [{ id: "g", title: "General", items: [
    { key: "workspace.approval.multi", label: "Multi-Level Approvals", type: "toggle", defaultValue: true },
  ]}]}]},
];

export const PLATFORM_SETTINGS_CATEGORIES: SettingCategoryDef[] = [
  { id: "licensing", title: "Licensing", description: "License status, domain binding, subscriptions", sections: [{ id: "main", title: "Licensing", groups: [{ id: "g", title: "License", items: [
    { key: "platform.license.domain_bind", label: "Domain Binding", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "feature-manager", title: "Feature Manager", description: "Module enable/disable, plan features", sections: [{ id: "main", title: "Features", groups: [{ id: "g", title: "Modules", items: [
    { key: "platform.features.inventory", label: "Inventory Module", type: "toggle", defaultValue: true },
    { key: "platform.features.marketplace", label: "Marketplace Module", type: "toggle", defaultValue: false },
  ]}]}]},
  { id: "ai-center", title: "AI Center", description: "AI providers, budget, usage, prompts", sections: [{ id: "main", title: "AI", groups: [{ id: "g", title: "Providers", items: [
    { key: "platform.ai.budget_monthly", label: "Monthly AI Budget (USD)", type: "number", defaultValue: 500 },
  ]}]}]},
  { id: "monitoring", title: "Monitoring", description: "Database, cache, queue, search health", sections: [{ id: "main", title: "Health", groups: [{ id: "g", title: "Monitoring", items: [
    { key: "platform.monitor.alerts", label: "Health Alert Emails", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "security", title: "Security", description: "Security policies, API, tokens, logs", sections: [{ id: "main", title: "Security", groups: [{ id: "g", title: "Policies", items: [
    { key: "platform.security.mfa", label: "Enforce MFA (Platform Admin)", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "updates", title: "Updates", description: "Update channels and release management", sections: [{ id: "main", title: "Updates", groups: [{ id: "g", title: "Channels", items: [
    { key: "platform.updates.channel", label: "Update Channel", type: "select", defaultValue: "stable", options: [
      { label: "Stable", value: "stable" },
      { label: "Beta", value: "beta" },
    ]},
  ]}]}]},
  { id: "analytics", title: "Analytics", description: "Platform usage and growth metrics", sections: [{ id: "main", title: "Analytics", groups: [{ id: "g", title: "Telemetry", items: [
    { key: "platform.analytics.usage", label: "Usage Statistics", type: "toggle", defaultValue: true },
  ]}]}]},
  { id: "marketplace", title: "Marketplace", description: "Module distribution and partners", sections: [{ id: "main", title: "Marketplace", groups: [{ id: "g", title: "Distribution", items: [
    { key: "platform.marketplace.public", label: "Public Marketplace", type: "toggle", defaultValue: false },
  ]}]}]},
];

export function getCategoriesForLayer(layer: SettingsLayer) {
  switch (layer) {
    case "business":
      return BUSINESS_SETTINGS_CATEGORIES;
    case "workspace":
      return WORKSPACE_SETTINGS_CATEGORIES;
    case "platform":
      return PLATFORM_SETTINGS_CATEGORIES;
  }
}

export function findCategory(layer: SettingsLayer, categoryId: string) {
  return getCategoriesForLayer(layer).find((c) => c.id === categoryId);
}

export function allSettingKeys(categories: SettingCategoryDef[]) {
  const keys: SettingItemDef[] = [];
  for (const cat of categories) {
    for (const sec of cat.sections) {
      for (const grp of sec.groups) {
        keys.push(...grp.items);
      }
    }
  }
  return keys;
}

export function buildDefaultValues(categories: SettingCategoryDef[]) {
  const values: Record<string, string | boolean | number> = {};
  for (const item of allSettingKeys(categories)) {
    values[item.key] = item.defaultValue;
  }
  return values;
}

export const SETTINGS_LAYER_META: Record<
  SettingsLayer,
  { title: string; subtitle: string; basePath: string; badge?: string }
> = {
  business: {
    title: "Business Settings",
    subtitle: "Daily store configuration for owners and staff",
    basePath: "/settings/business",
  },
  workspace: {
    title: "Workspace Settings",
    subtitle: "Organization, users, branches, and workflows",
    basePath: "/workspace",
  },
  platform: {
    title: "Control Center",
    subtitle: "Platform intelligence — MoharazNX internal only",
    basePath: "/control-center",
    badge: "Internal",
  },
};
