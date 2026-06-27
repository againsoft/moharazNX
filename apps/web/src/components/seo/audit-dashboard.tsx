"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Globe,
  FileText,
  Link2,
  Zap,
  Smartphone,
  Tag,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  auditIssuesSeed,
  auditCrawlInfo,
  AUDIT_CATEGORY_LABELS,
  AUDIT_CATEGORY_SCORES,
  type SeoAuditIssue,
  type AuditCategory,
  type AuditIssueStatus,
  type SeoIssueSeverity,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";

/* ─── Severity config ─────────────────────────────────────────────────────── */

const SEVERITY_CONFIG: Record<SeoIssueSeverity, { label: string; icon: React.ReactNode; bar: string; badge: string; dot: string }> = {
  high:   { label: "High",   icon: <XCircle    className="h-3.5 w-3.5" />, bar: "bg-red-500",    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",    dot: "bg-red-500" },
  medium: { label: "Medium", icon: <AlertCircle className="h-3.5 w-3.5" />, bar: "bg-amber-500",  badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400", dot: "bg-amber-500" },
  low:    { label: "Low",    icon: <Info        className="h-3.5 w-3.5" />, bar: "bg-blue-400",   badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",   dot: "bg-blue-400" },
};

const STATUS_CONFIG: Record<AuditIssueStatus, { label: string; cls: string }> = {
  open:    { label: "Open",    cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" },
  fixed:   { label: "Fixed",   cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" },
  ignored: { label: "Ignored", cls: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400" },
};

const CATEGORY_ICONS: Record<AuditCategory, React.ReactNode> = {
  meta:        <Tag        className="h-4 w-4" />,
  content:     <FileText   className="h-4 w-4" />,
  technical:   <Globe      className="h-4 w-4" />,
  links:       <Link2      className="h-4 w-4" />,
  performance: <Zap        className="h-4 w-4" />,
  mobile:      <Smartphone className="h-4 w-4" />,
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  missing_meta_title:    "Missing meta title",
  missing_meta_description: "Missing meta description",
  duplicate_title:       "Duplicate title",
  title_too_long:        "Title too long",
  missing_og_image:      "Missing OG image",
  missing_schema:        "Missing schema markup",
  thin_content:          "Thin content",
  missing_h1:            "Missing H1",
  duplicate_content:     "Duplicate content",
  missing_alt_text:      "Missing alt text",
  keyword_stuffing:      "Keyword stuffing",
  short_description:     "Description too short",
  broken_link:           "Broken internal link",
  broken_external_link:  "Broken external link",
  redirect_chain:        "Redirect chain",
  mixed_content:         "Mixed content (HTTP/HTTPS)",
  missing_canonical:     "Missing canonical tag",
  noindex_in_sitemap:    "No-index page in sitemap",
  sitemap_missing:       "Sitemap stale/missing",
  robots_blocked:        "Robots.txt block",
  orphan_page:           "Orphan page",
  too_many_links:        "Too many links",
  generic_anchor_text:   "Generic anchor text",
  slow_lcp:              "Slow LCP (Core Web Vital)",
  large_images:          "Oversized images",
  render_blocking:       "Render-blocking resources",
  no_cache_headers:      "Missing cache headers",
  cls_shift:             "Layout shift (CLS)",
  tap_target_small:      "Tap target too small",
  viewport_not_set:      "Missing viewport tag",
  font_too_small:        "Font too small on mobile",
  horizontal_scroll:     "Horizontal scroll on mobile",
};

/* ─── Score ring ──────────────────────────────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Good" : score >= 60 ? "Needs work" : "Poor";
  const labelCls = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-[130px] w-[130px] items-center justify-center">
        <svg className="-rotate-90" width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
          <circle
            cx="65" cy="65" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">{score}</span>
          <span className="text-[11px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", labelCls)}>{label}</span>
    </div>
  );
}

/* ─── Category score bar ──────────────────────────────────────────────────── */

function CategoryScoreBar({ category, score, issueCount }: { category: AuditCategory; score: number; issueCount: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  const textColor = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-500";
  return (
    <div className="group space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{CATEGORY_ICONS[category]}</span>
          {AUDIT_CATEGORY_LABELS[category]}
        </div>
        <div className="flex items-center gap-2">
          {issueCount > 0 && (
            <span className="text-[11px] text-muted-foreground">{issueCount} issue{issueCount > 1 ? "s" : ""}</span>
          )}
          <span className={cn("text-sm font-bold tabular-nums", textColor)}>{score}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

/* ─── Issue row ───────────────────────────────────────────────────────────── */

function IssueRow({ issue }: { issue: SeoAuditIssue }) {
  const [status, setStatus] = useState<AuditIssueStatus>(issue.status);
  const sev = SEVERITY_CONFIG[issue.severity];
  const st = STATUS_CONFIG[status];

  return (
    <div className={cn(
      "group grid grid-cols-[20px_1fr_auto] gap-x-3 gap-y-1 rounded-lg border border-input bg-card px-4 py-3 transition-colors hover:bg-muted/20",
      status === "fixed" && "opacity-60",
      status === "ignored" && "opacity-40",
    )}>
      {/* Severity dot */}
      <div className="mt-0.5 flex justify-center">
        <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", sev.dot)} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium leading-tight">
            {ISSUE_TYPE_LABELS[issue.type] ?? issue.type.replace(/_/g, " ")}
          </span>
          <span className={cn("inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", sev.badge)}>
            {sev.icon} {sev.label}
          </span>
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", st.cls)}>
            {st.label}
          </span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{issue.url}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">{issue.suggestion}</p>
        {issue.affectedCount && issue.affectedCount > 1 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">Affects {issue.affectedCount} items</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={() => toast.info("View page — prototype")}
          className="hidden text-muted-foreground hover:text-foreground group-hover:block"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value as AuditIssueStatus); toast.success(`Marked as ${e.target.value}`); }}
          className="h-6 w-[80px] border-0 bg-transparent p-0 text-[11px] text-muted-foreground shadow-none focus:ring-0"
        >
          <option value="open">Open</option>
          <option value="fixed">Fixed</option>
          <option value="ignored">Ignore</option>
        </Select>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

const ALL_CATEGORIES: AuditCategory[] = ["meta", "content", "technical", "links", "performance", "mobile"];

export function AuditDashboard() {
  const [issues, setIssues] = useState(auditIssuesSeed);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("open");
  const [search, setSearch] = useState("");
  const [crawling, setCrawling] = useState(false);

  const filteredIssues = useMemo(() => {
    const q = search.toLowerCase();
    return issues.filter((i) => {
      if (filterSeverity !== "all" && i.severity !== filterSeverity) return false;
      if (filterCategory !== "all" && i.category !== filterCategory) return false;
      if (filterStatus !== "all" && i.status !== filterStatus) return false;
      if (q && !i.url.toLowerCase().includes(q) && !i.entity.toLowerCase().includes(q) && !(ISSUE_TYPE_LABELS[i.type] ?? i.type).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [issues, filterSeverity, filterCategory, filterStatus, search]);

  const openIssues   = issues.filter((i) => i.status === "open");
  const fixedIssues  = issues.filter((i) => i.status === "fixed");
  const highIssues   = openIssues.filter((i) => i.severity === "high");
  const medIssues    = openIssues.filter((i) => i.severity === "medium");
  const lowIssues    = openIssues.filter((i) => i.severity === "low");

  const categoryIssueCounts = useMemo(() =>
    Object.fromEntries(
      ALL_CATEGORIES.map((cat) => [cat, openIssues.filter((i) => i.category === cat).length])
    ) as Record<AuditCategory, number>,
    [openIssues],
  );

  const handleRunAudit = () => {
    setCrawling(true);
    setTimeout(() => { setCrawling(false); toast.success("Audit complete — 50 issues checked"); }, 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top: Score + KPIs + Category bars ── */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        {/* Score card */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-input bg-card p-5 shadow-sm sm:flex-row lg:flex-col lg:w-48">
          <ScoreRing score={auditCrawlInfo.healthScore} />
          <div className="space-y-1 text-center lg:text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Site Health</p>
            <div className="flex items-center gap-1 justify-center sm:justify-start lg:justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+4 from last week</span>
            </div>
          </div>
        </div>

        {/* Right side: KPIs + Category scores */}
        <div className="flex flex-col gap-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Open issues",    value: openIssues.length,  sub: `${highIssues.length} critical`,  cls: "text-red-500",      icon: <XCircle     className="h-4 w-4 text-red-400" /> },
              { label: "High severity",  value: highIssues.length,  sub: "need immediate fix",             cls: "text-red-500",      icon: <AlertTriangle className="h-4 w-4 text-red-400" /> },
              { label: "Fixed",          value: fixedIssues.length, sub: `of ${issues.length} total`,      cls: "text-emerald-600",  icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
              { label: "Pages crawled",  value: auditCrawlInfo.pagesCrawled, sub: auditCrawlInfo.lastCrawl.split(" ")[0], cls: "text-foreground", icon: <Globe className="h-4 w-4 text-muted-foreground" /> },
            ].map((k) => (
              <div key={k.label} className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 shadow-sm">
                <div className="rounded-lg bg-muted/50 p-1.5 shrink-0">{k.icon}</div>
                <div className="min-w-0">
                  <p className={cn("text-xl font-bold tabular-nums", k.cls)}>{k.value}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{k.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground/70">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category score bars */}
          <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Score by Category</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_CATEGORIES.map((cat) => (
                <CategoryScoreBar
                  key={cat}
                  category={cat}
                  score={AUDIT_CATEGORY_SCORES[cat]}
                  issueCount={categoryIssueCounts[cat]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Crawl info bar ── */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-input bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Last crawl: <span className="font-medium text-foreground">{auditCrawlInfo.lastCrawl}</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          <span><span className="font-medium text-foreground">{auditCrawlInfo.pagesCrawled}</span> pages in {auditCrawlInfo.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Next: <span className="font-medium text-foreground">{auditCrawlInfo.nextCrawl}</span></span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto gap-1.5 h-7"
          onClick={handleRunAudit}
          disabled={crawling}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", crawling && "animate-spin")} />
          {crawling ? "Crawling…" : "Run audit"}
        </Button>
      </div>

      {/* ── Severity summary ── */}
      <div className="grid grid-cols-3 gap-3">
        {(["high", "medium", "low"] as SeoIssueSeverity[]).map((sev) => {
          const cfg = SEVERITY_CONFIG[sev];
          const count = openIssues.filter((i) => i.severity === sev).length;
          return (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(filterSeverity === sev ? "all" : sev)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 text-left shadow-sm transition-all hover:bg-muted/30",
                filterSeverity === sev && "ring-2 ring-primary ring-offset-1",
              )}
            >
              <span className={cn("h-3 w-3 shrink-0 rounded-full", cfg.dot)} />
              <div>
                <p className="text-lg font-bold tabular-nums">{count}</p>
                <p className="text-[11px] text-muted-foreground">{cfg.label} severity</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Issue list ── */}
      <div className="flex flex-col gap-3">
        {/* List toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 w-[180px]"
            />
          </div>
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-8 w-[150px] text-sm">
            <option value="all">All categories</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{AUDIT_CATEGORY_LABELS[c]}</option>)}
          </Select>
          <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="h-8 w-[130px] text-sm">
            <option value="all">All severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 w-[120px] text-sm">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="fixed">Fixed</option>
            <option value="ignored">Ignored</option>
          </Select>
          {(filterSeverity !== "all" || filterCategory !== "all" || filterStatus !== "open" || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-muted-foreground"
              onClick={() => { setFilterSeverity("all"); setFilterCategory("all"); setFilterStatus("open"); setSearch(""); }}
            >
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
              filterCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-input bg-card text-muted-foreground hover:bg-muted/40",
            )}
          >
            All
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", filterCategory === "all" ? "bg-white/20" : "bg-muted")}>
              {openIssues.length}
            </span>
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const cnt = categoryIssueCounts[cat];
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(active ? "all" : cat)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-card text-muted-foreground hover:bg-muted/40",
                )}
              >
                {CATEGORY_ICONS[cat]}
                {AUDIT_CATEGORY_LABELS[cat]}
                {cnt > 0 && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", active ? "bg-white/20" : "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400")}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Issues */}
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-input bg-card py-14">
            <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
            <p className="font-medium">No issues match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different category or severity</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
