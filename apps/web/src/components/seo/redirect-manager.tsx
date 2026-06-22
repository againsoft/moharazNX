"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Plus, Search, Download, MoreHorizontal, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Ban,
  SlidersHorizontal, X,
} from "lucide-react";
import { toast } from "sonner";
import { redirectRulesSeed, type RedirectRule, type RedirectType, type RedirectStatus } from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Config ───────────────────────────────────────────────────────────────── */

const TYPE_STYLES: Record<RedirectType, { cls: string; desc: string }> = {
  "301": { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", desc: "Permanent" },
  "302": { cls: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",                  desc: "Temporary" },
  "307": { cls: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",      desc: "Temp (method)" },
  "308": { cls: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",            desc: "Perm (method)" },
  "410": { cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",                        desc: "Gone" },
};

const STATUS_STYLES: Record<RedirectStatus, { cls: string; icon: React.ReactNode; label: string }> = {
  active:   { cls: "text-emerald-600", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Active"   },
  draft:    { cls: "text-blue-500",    icon: <Clock className="h-3.5 w-3.5" />,         label: "Draft"    },
  disabled: { cls: "text-slate-400",   icon: <Ban className="h-3.5 w-3.5" />,           label: "Disabled" },
};

function TypeBadge({ type }: { type: RedirectType }) {
  const s = TYPE_STYLES[type];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold", s.cls)}>
      {type} <span className="ml-1 font-normal opacity-70">{s.desc}</span>
    </span>
  );
}

function StatusPill({ status }: { status: RedirectStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", s.cls)}>
      {s.icon} {s.label}
    </span>
  );
}

/* ─── Add / Edit sheet ─────────────────────────────────────────────────────── */

const EMPTY_RULE: Omit<RedirectRule, "id" | "hits30d" | "createdAt" | "updatedAt"> = {
  from: "", to: "", type: "301", status: "active", note: "",
};

function RedirectSheet({
  open, onClose, initial,
}: { open: boolean; onClose: () => void; initial?: Partial<RedirectRule> }) {
  const [form, setForm] = useState({ ...EMPTY_RULE, ...initial });
  const is410 = form.type === "410";

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.from) { toast.error("Source path is required"); return; }
    if (!is410 && !form.to) { toast.error("Target URL is required"); return; }
    toast.success(initial?.id ? "Redirect updated — prototype" : "Redirect created — prototype");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b border-input px-5 py-4">
          <p className="text-base font-semibold">{initial?.id ? "Edit redirect" : "Add redirect rule"}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Redirect type</label>
            <div className="flex flex-wrap gap-2">
              {(["301", "302", "307", "308", "410"] as RedirectType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    form.type === t
                      ? cn(TYPE_STYLES[t].cls, "ring-2 ring-offset-1 ring-current/40")
                      : "border-input bg-muted/30 text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="font-bold">{t}</span> — {TYPE_STYLES[t].desc}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {form.type === "301" && "Best for permanent URL changes — passes full SEO equity"}
              {form.type === "302" && "Temporary redirect — no SEO equity transfer, original URL stays indexed"}
              {form.type === "307" && "Temporary redirect, preserves HTTP method (POST stays POST)"}
              {form.type === "308" && "Permanent redirect, preserves HTTP method"}
              {form.type === "410" && "Page is permanently gone — tells crawlers to de-index immediately"}
            </p>
          </div>

          {/* From */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Source path</label>
            <Input
              placeholder="/old-url-path"
              value={form.from}
              onChange={(e) => set("from", e.target.value)}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Relative path, e.g. /old-products/shoes — supports * wildcard</p>
          </div>

          {/* To */}
          {!is410 && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Target URL / path</label>
              <Input
                placeholder="/new-url or https://example.com/page"
                value={form.to}
                onChange={(e) => set("to", e.target.value)}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Relative path or absolute URL</p>
            </div>
          )}

          {is410 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle className="mb-0.5 inline h-3.5 w-3.5" /> 410 Gone has no target URL — the server returns "permanently removed" to browsers and crawlers.
            </div>
          )}

          {/* Preview */}
          {form.from && (
            <div className="rounded-lg bg-muted/30 border border-input px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Preview</p>
              <div className="flex items-center gap-2 font-mono text-[12px] flex-wrap">
                <span className="text-foreground">{form.from}</span>
                {!is410 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                {!is410 && <span className="text-primary">{form.to || "…"}</span>}
                {is410 && <span className="text-red-500 font-sans">→ 410 Gone</span>}
                <TypeBadge type={form.type} />
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
            <div className="flex gap-2">
              {(["active", "draft", "disabled"] as RedirectStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    form.status === s ? "border-primary bg-primary/5 text-primary" : "border-input bg-muted/30 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {STATUS_STYLES[s].icon} {STATUS_STYLES[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Note (optional)</label>
            <Input placeholder="e.g. URL change after site redesign" value={form.note ?? ""} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>

        <div className="border-t border-input px-5 py-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>
            {initial?.id ? "Save changes" : "Create redirect"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */

export function RedirectManager() {
  const isDark = useIsDark();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editRow, setEditRow] = useState<RedirectRule | undefined>();
  const [selected, setSelected] = useState<RedirectRule[]>([]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return redirectRulesSeed.filter((r) => {
      if (q && !r.from.includes(q) && !r.to.includes(q) && !(r.note ?? "").toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [search, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:    redirectRulesSeed.length,
    active:   redirectRulesSeed.filter((r) => r.status === "active").length,
    draft:    redirectRulesSeed.filter((r) => r.status === "draft").length,
    disabled: redirectRulesSeed.filter((r) => r.status === "disabled").length,
    hits:     redirectRulesSeed.reduce((s, r) => s + r.hits30d, 0),
  }), []);

  const colDefs = useMemo<ColDef<RedirectRule>[]>(() => [
    {
      headerCheckboxSelection: true, checkboxSelection: true,
      width: 40, maxWidth: 40, pinned: "left", resizable: false, sortable: false,
      suppressHeaderMenuButton: true, suppressMovable: true,
    },
    {
      field: "from", headerName: "From → To", width: 380, minWidth: 220, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data ? (
        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] font-medium truncate">{p.data.from}</span>
          </div>
          {p.data.type !== "410" ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="font-mono truncate">{p.data.to}</span>
            </div>
          ) : (
            <span className="text-[11px] text-red-500">→ 410 Gone</span>
          )}
        </div>
      ) : null,
    },
    {
      field: "type", headerName: "Type", width: 130, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data ? <TypeBadge type={p.data.type} /> : null,
    },
    {
      field: "status", headerName: "Status", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data ? <StatusPill status={p.data.status} /> : null,
    },
    {
      field: "hits30d", headerName: "Hits (30d)", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data ? (
        <span className={cn("text-xs font-semibold tabular-nums", p.data.hits30d > 500 ? "text-primary" : p.data.hits30d === 0 ? "text-muted-foreground" : "")}>
          {p.data.hits30d > 0 ? p.data.hits30d.toLocaleString() : "—"}
        </span>
      ) : null,
    },
    {
      field: "note", headerName: "Note", flex: 1, minWidth: 120, resizable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data?.note
        ? <span className="text-[11px] text-muted-foreground italic">{p.data.note}</span>
        : null,
    },
    {
      field: "updatedAt", headerName: "Updated", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data
        ? <span className="text-[11px] text-muted-foreground">{p.data.updatedAt}</span>
        : null,
    },
    {
      colId: "actions", headerName: "", width: 44, maxWidth: 44, pinned: "right",
      resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<RedirectRule>) => p.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditRow(p.data!); setSheetOpen(true); }}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Duplicate — prototype")}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => toast.success("Deleted — prototype")}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-4">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total",    value: stats.total,                    cls: "" },
          { label: "Active",   value: stats.active,                   cls: "text-emerald-600" },
          { label: "Draft",    value: stats.draft,                    cls: "text-blue-500" },
          { label: "Disabled", value: stats.disabled,                 cls: "text-slate-400" },
          { label: "Hits / 30d", value: stats.hits.toLocaleString(),  cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-input bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", s.cls)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search paths…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[200px] pl-8" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All types</option>
          {(["301","302","307","308","410"] as RedirectType[]).map((t) => <option key={t} value={t}>{t} — {TYPE_STYLES[t].desc}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="disabled">Disabled</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 py-1.5">
            <span className="text-xs font-medium">{selected.length} selected</span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-red-500 hover:text-red-600 px-2" onClick={() => toast.success("Deleted — prototype")}>Delete</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => toast.success("Disabled — prototype")}>Disable</Button>
          </div>
        )}

        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs" onClick={() => toast.success("Exporting — prototype")}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setEditRow(undefined); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add redirect
        </Button>
      </div>

      {/* ── Grid ── */}
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
         theme="legacy"
          domLayout="autoHeight"
          rowData={filtered}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
          rowSelection="multiple"
          suppressRowClickSelection
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          animateRows
          pagination
          paginationPageSize={20}
        />
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} redirect rules</p>

      <RedirectSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditRow(undefined); }}
        initial={editRow}
      />
    </div>
  );
}
