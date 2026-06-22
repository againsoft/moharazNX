import type { PluginDef } from "./types";

export const PLUGIN_CATEGORIES: Record<
  PluginDef["category"],
  { label: string; description: string }
> = {
  shipping: { label: "Shipping & Delivery", description: "Courier and last-mile delivery" },
  payment: { label: "Payments", description: "Payment gateways and wallets" },
  marketing: { label: "Marketing", description: "SMS, email, and social channels" },
  accounting: { label: "Accounting", description: "Invoicing and bookkeeping" },
  communication: { label: "Communication", description: "WhatsApp, chat, and support" },
  other: { label: "Other", description: "Miscellaneous integrations" },
};

export const PLUGIN_REGISTRY: PluginDef[] = [
  {
    id: "pathao",
    name: "Pathao Courier",
    description: "Automate shipping, tracking, and COD reconciliation with Pathao.",
    longDescription:
      "Connect your store to Pathao Courier for automated shipment creation, live tracking updates, and delivery status sync back to orders.",
    category: "shipping",
    version: "1.0.0",
    author: "Pathao Ltd.",
    website: "https://pathao.com",
    docsUrl: "https://merchant.pathao.com/docs",
    brandColor: "#E52427",
    sections: [
      {
        id: "connection",
        title: "API Connection",
        description: "Credentials from Pathao Merchant Dashboard",
        fields: [
          {
            key: "client_id",
            label: "Client ID",
            type: "text",
            defaultValue: "",
            placeholder: "Enter Pathao Client ID",
            required: true,
          },
          {
            key: "client_secret",
            label: "Client Secret",
            type: "password",
            defaultValue: "",
            placeholder: "Enter Client Secret",
            required: true,
          },
          {
            key: "store_id",
            label: "Merchant Store ID",
            type: "text",
            defaultValue: "",
            placeholder: "Pathao store / merchant ID",
            required: true,
          },
          {
            key: "environment",
            label: "Environment",
            type: "select",
            defaultValue: "sandbox",
            options: [
              { label: "Sandbox (Testing)", value: "sandbox" },
              { label: "Production (Live)", value: "production" },
            ],
          },
        ],
      },
      {
        id: "pickup",
        title: "Pickup & Delivery",
        fields: [
          {
            key: "pickup_address",
            label: "Default Pickup Address",
            type: "text",
            defaultValue: "House 12, Road 5, Dhanmondi, Dhaka 1209",
            placeholder: "Warehouse or store pickup address",
          },
          {
            key: "pickup_phone",
            label: "Pickup Contact Phone",
            type: "text",
            defaultValue: "+880 9612-345678",
          },
          {
            key: "default_service",
            label: "Default Service Type",
            type: "select",
            defaultValue: "regular",
            options: [
              { label: "Regular Delivery", value: "regular" },
              { label: "Express Delivery", value: "express" },
              { label: "Same Day", value: "same_day" },
            ],
          },
          {
            key: "item_type",
            label: "Default Item Type",
            type: "select",
            defaultValue: "parcel",
            options: [
              { label: "Parcel", value: "parcel" },
              { label: "Document", value: "document" },
            ],
          },
        ],
      },
      {
        id: "automation",
        title: "Order Automation",
        fields: [
          {
            key: "auto_create_shipment",
            label: "Auto Create Shipment on Order Confirm",
            type: "toggle",
            defaultValue: true,
            description: "Automatically send order to Pathao when order is confirmed",
          },
          {
            key: "sync_tracking",
            label: "Sync Tracking to Order",
            type: "toggle",
            defaultValue: true,
            description: "Update order with Pathao tracking ID and status",
          },
          {
            key: "cod_enabled",
            label: "Cash on Delivery (COD)",
            type: "toggle",
            defaultValue: true,
            description: "Allow COD shipments via Pathao",
          },
          {
            key: "webhook_url",
            label: "Webhook URL",
            type: "url",
            defaultValue: "https://store.again.com.bd/api/webhooks/pathao",
            description: "Configure this URL in Pathao Merchant Dashboard for status updates",
          },
        ],
      },
    ],
  },
  {
    id: "steadfast",
    name: "Steadfast Courier",
    description: "Steadfast parcel booking, tracking, and COD management.",
    category: "shipping",
    version: "1.0.0",
    author: "Steadfast Courier",
    website: "https://steadfast.com.bd",
    brandColor: "#0066B3",
    sections: [
      {
        id: "connection",
        title: "API Connection",
        fields: [
          { key: "api_key", label: "API Key", type: "password", defaultValue: "", required: true },
          { key: "secret_key", label: "Secret Key", type: "password", defaultValue: "", required: true },
          {
            key: "environment",
            label: "Environment",
            type: "select",
            defaultValue: "sandbox",
            options: [
              { label: "Sandbox", value: "sandbox" },
              { label: "Production", value: "production" },
            ],
          },
        ],
      },
      {
        id: "automation",
        title: "Automation",
        fields: [
          {
            key: "auto_create_shipment",
            label: "Auto Create Parcel on Confirm",
            type: "toggle",
            defaultValue: false,
          },
          { key: "cod_enabled", label: "COD Shipments", type: "toggle", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "bkash",
    name: "bKash Payment Gateway",
    description: "Accept bKash payments and auto-verify transactions.",
    category: "payment",
    version: "1.0.0",
    author: "bKash Limited",
    website: "https://bkash.com",
    brandColor: "#E2136E",
    sections: [
      {
        id: "credentials",
        title: "Merchant Credentials",
        fields: [
          { key: "username", label: "Username", type: "text", defaultValue: "", required: true },
          { key: "password", label: "Password", type: "password", defaultValue: "", required: true },
          { key: "app_key", label: "App Key", type: "password", defaultValue: "", required: true },
          { key: "app_secret", label: "App Secret", type: "password", defaultValue: "", required: true },
          {
            key: "environment",
            label: "Environment",
            type: "select",
            defaultValue: "sandbox",
            options: [
              { label: "Sandbox", value: "sandbox" },
              { label: "Production", value: "production" },
            ],
          },
        ],
      },
      {
        id: "checkout",
        title: "Checkout",
        fields: [
          { key: "checkout_enabled", label: "Show bKash at Checkout", type: "toggle", defaultValue: true },
          { key: "auto_verify", label: "Auto Verify Payment", type: "toggle", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "sslcommerz",
    name: "SSLCommerz",
    description: "Card, mobile banking, and wallet payments via SSLCommerz.",
    category: "payment",
    version: "1.0.0",
    author: "SSLCommerz",
    website: "https://sslcommerz.com",
    brandColor: "#1B4F8A",
    sections: [
      {
        id: "credentials",
        title: "Store Credentials",
        fields: [
          { key: "store_id", label: "Store ID", type: "text", defaultValue: "", required: true },
          { key: "store_password", label: "Store Password", type: "password", defaultValue: "", required: true },
          {
            key: "environment",
            label: "Environment",
            type: "select",
            defaultValue: "sandbox",
            options: [
              { label: "Sandbox", value: "sandbox" },
              { label: "Production", value: "production" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bank-emi",
    name: "Bank EMI Calculator",
    description: "Show bank-wise EMI installment plans on product, cart, and PC builder.",
    longDescription:
      "Apple Gadgets–style EMI modal — customers compare monthly installments across AB Bank, Brac, Bank Asia, and more. Admin configures tenure rates and minimum order amount.",
    category: "payment",
    version: "1.0.0",
    author: "MoharazNX",
    website: "https://again.com.bd",
    brandColor: "#D97706",
    sections: [
      {
        id: "general",
        title: "General",
        fields: [
          {
            key: "plugin_enabled",
            label: "Enable EMI on storefront",
            type: "toggle",
            defaultValue: true,
          },
          {
            key: "min_order_amount",
            label: "Minimum order amount (BDT)",
            type: "number",
            defaultValue: 5000,
            required: true,
          },
          {
            key: "label_en",
            label: "PDP label (EN)",
            type: "text",
            defaultValue: "EMI Available for orders above ৳ {min}",
          },
          {
            key: "label_bn",
            label: "PDP label (BN)",
            type: "text",
            defaultValue: "{min} টাকার বেশি অর্ডারে কিস্তি সুবিধা",
          },
        ],
      },
      {
        id: "display",
        title: "Display surfaces",
        fields: [
          { key: "show_on_pdp", label: "Product page", type: "toggle", defaultValue: true },
          { key: "show_on_cart", label: "Shopping cart", type: "toggle", defaultValue: true },
          { key: "show_on_builder", label: "PC Builder summary", type: "toggle", defaultValue: true },
        ],
      },
      {
        id: "banks",
        title: "Banks & Plans",
        description: "Add banks and set EMI charge % per tenure",
        fields: [],
      },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description: "Verify Cloudflare account, connect R2 media storage, Images API, and CDN.",
    longDescription:
      "Install করার পর API token verify করুন। Verify হলে R2 bucket, Cloudflare Images, এবং media storage (local বা R2) configure করতে পারবেন।",
    category: "other",
    version: "1.0.0",
    author: "Cloudflare",
    website: "https://cloudflare.com",
    docsUrl: "https://developers.cloudflare.com/r2/",
    brandColor: "#F38020",
    sections: [
      {
        id: "account",
        title: "Account Verification",
        description: "API token + Account ID",
        fields: [],
      },
      {
        id: "media",
        title: "Media Storage",
        description: "Local disk or Cloudflare R2",
        fields: [],
      },
      {
        id: "r2",
        title: "R2 Storage",
        description: "Bucket, keys, CDN URL",
        fields: [],
      },
      {
        id: "images",
        title: "Cloudflare Images",
        description: "Optional image API",
        fields: [],
      },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Order updates and marketing via WhatsApp Business API.",
    category: "communication",
    version: "1.0.0",
    author: "Meta",
    website: "https://business.whatsapp.com",
    brandColor: "#25D366",
    sections: [
      {
        id: "connection",
        title: "API Setup",
        fields: [
          { key: "phone_number_id", label: "Phone Number ID", type: "text", defaultValue: "" },
          { key: "access_token", label: "Access Token", type: "password", defaultValue: "" },
          { key: "business_account_id", label: "Business Account ID", type: "text", defaultValue: "" },
        ],
      },
      {
        id: "notifications",
        title: "Notifications",
        fields: [
          { key: "order_confirm", label: "Order Confirmation Message", type: "toggle", defaultValue: true },
          { key: "shipped_notify", label: "Shipped Notification", type: "toggle", defaultValue: true },
        ],
      },
    ],
  },
];

export function findPlugin(id: string): PluginDef | undefined {
  return PLUGIN_REGISTRY.find((p) => p.id === id);
}

export function buildPluginDefaults(plugin: PluginDef): Record<string, string | boolean | number> {
  const config: Record<string, string | boolean | number> = {};
  for (const section of plugin.sections) {
    for (const field of section.fields) {
      config[field.key] = field.defaultValue;
    }
  }
  return config;
}

export function getAllPluginFieldKeys(plugin: PluginDef): string[] {
  return plugin.sections.flatMap((s) => s.fields.map((f) => f.key));
}
