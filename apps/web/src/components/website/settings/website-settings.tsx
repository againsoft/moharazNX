"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebsiteNav } from "@/components/website/website-nav";

const TABS = ["General", "Theme & Branding", "Analytics & Scripts", "Social Media", "Maintenance"] as const;
type Tab = (typeof TABS)[number];

export function WebsiteSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("General");

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Configure your website preferences</p>
        </div>
      </div>

      <WebsiteNav compact />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-input pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="rounded-lg border border-input bg-card p-6 shadow-sm max-w-2xl space-y-5">
        {activeTab === "General" && (
          <>
            <Field label="Site Name" placeholder="MoharazNX" hint="Shown in browser tab and search results" />
            <Field label="Site Description / Tagline" placeholder="Modern ERP for Bangladeshi businesses" multiline />
            <Field label="Copyright Text" placeholder="© 2026 AgainSoftware. All rights reserved." multiline />
          </>
        )}

        {activeTab === "Theme & Branding" && (
          <>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#6366f1" className="h-9 w-14 rounded border border-input cursor-pointer" />
                <Input defaultValue="#6366f1" className="h-9 max-w-[140px] font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#8b5cf6" className="h-9 w-14 rounded border border-input cursor-pointer" />
                <Input defaultValue="#8b5cf6" className="h-9 max-w-[140px] font-mono text-sm" />
              </div>
            </div>
            <Field label="Heading Font" placeholder="Inter" hint="Google Font name" />
            <Field label="Body Font" placeholder="Inter" hint="Google Font name" />
          </>
        )}

        {activeTab === "Analytics & Scripts" && (
          <>
            <Field label="Google Analytics ID (GA4)" placeholder="G-XXXXXXXXXX" />
            <Field label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
            <Field label="Facebook Pixel ID" placeholder="1234567890123" />
            <Field label="Custom Head Scripts" placeholder="<script>...</script>" multiline hint="Injected before </head>" />
            <Field label="Custom Body Scripts" placeholder="<script>...</script>" multiline hint="Injected before </body>" />
          </>
        )}

        {activeTab === "Social Media" && (
          <>
            <Field label="Facebook URL" placeholder="https://facebook.com/yourpage" />
            <Field label="Instagram URL" placeholder="https://instagram.com/yourhandle" />
            <Field label="Twitter / X URL" placeholder="https://x.com/yourhandle" />
            <Field label="LinkedIn URL" placeholder="https://linkedin.com/company/yourpage" />
            <Field label="YouTube URL" placeholder="https://youtube.com/@yourchannel" />
            <Field label="WhatsApp Number" placeholder="+8801XXXXXXXXX" />
          </>
        )}

        {activeTab === "Maintenance" && (
          <>
            <Toggle label="Maintenance Mode" description="Show maintenance page to all visitors" />
            <Toggle label="Coming Soon Mode" description="Show coming soon page to new visitors" />
            <Toggle label="Password Protection" description="Require a password to access the site" />
            <Field label="Maintenance Message" placeholder="We'll be back soon. Thank you for your patience." multiline />
          </>
        )}

        <div className="pt-2 border-t border-input">
          <Button size="sm">
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, hint, multiline }: { label: string; placeholder?: string; hint?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-muted-foreground mb-1">{label}</label>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      ) : (
        <Input placeholder={placeholder} className="h-9 text-sm" />
      )}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ label, description }: { label: string; description: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
