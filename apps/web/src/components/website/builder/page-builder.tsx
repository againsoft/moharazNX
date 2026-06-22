"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft, Eye, Save, Smartphone, Tablet, Monitor,
  Type, Image as ImageIcon, LayoutGrid, Star, ArrowRight, ShoppingBag,
  MessageSquare, Mail, Users, BarChart2, Film,
  ChevronDown, Trash2, Copy, Settings2, GripVertical,
  Plus, Globe, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { websitePagesSeed } from "@/lib/mock-data/website";
import { mockWebsiteLayouts } from "@/lib/mock-data/website-layouts";

// ─── Block types & data ───────────────────────────────────────────────────────

type BlockType =
  | "hero" | "text" | "image" | "two-col" | "cta"
  | "features" | "testimonials" | "product-grid"
  | "faq" | "contact-form" | "team" | "stats"
  | "video" | "spacer";

interface BlockData {
  heading?: string;
  subheading?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  background?: string;
  columns?: string;
  imageUrl?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

interface Block {
  id: string;
  type: BlockType;
  label: string;
  data: BlockData;
}

const BLOCK_LIBRARY: { category: string; blocks: { type: BlockType; label: string; icon: React.ElementType }[] }[] = [
  {
    category: "Content",
    blocks: [
      { type: "hero",    label: "Hero Banner",    icon: ImageIcon },
      { type: "text",    label: "Rich Text",      icon: Type },
      { type: "image",   label: "Image / Gallery", icon: ImageIcon },
      { type: "two-col", label: "Two Columns",    icon: LayoutGrid },
      { type: "video",   label: "Video",          icon: Film },
      { type: "spacer",  label: "Spacer",         icon: Minus },
    ],
  },
  {
    category: "Commerce",
    blocks: [
      { type: "product-grid", label: "Product Grid",   icon: ShoppingBag },
      { type: "cta",          label: "Call to Action", icon: ArrowRight },
    ],
  },
  {
    category: "Social Proof",
    blocks: [
      { type: "testimonials", label: "Testimonials",   icon: Star },
      { type: "team",         label: "Team",           icon: Users },
      { type: "stats",        label: "Stats / Numbers", icon: BarChart2 },
    ],
  },
  {
    category: "Engage",
    blocks: [
      { type: "features",     label: "Features Grid",  icon: LayoutGrid },
      { type: "faq",          label: "FAQ",            icon: MessageSquare },
      { type: "contact-form", label: "Contact Form",   icon: Mail },
    ],
  },
];

const DEFAULT_DATA: Record<BlockType, BlockData> = {
  hero:           { heading: "Welcome to our site", subheading: "We build amazing things", buttonText: "Get Started", buttonUrl: "/contact", background: "dark" },
  text:           { heading: "", body: "Enter your content here.", background: "white" },
  image:          { heading: "", imageUrl: "", background: "white" },
  "two-col":      { heading: "Two Column Section", body: "Content goes here.", background: "white" },
  cta:            { heading: "Ready to get started?", subheading: "Join thousands of happy customers.", buttonText: "Start Now", buttonUrl: "/signup", background: "primary" },
  features:       { heading: "Why choose us", subheading: "We offer the best features", background: "light" },
  testimonials:   { heading: "What our customers say", background: "light" },
  "product-grid": { heading: "Featured Products", columns: "3", background: "white" },
  faq:            { heading: "Frequently Asked Questions", background: "white" },
  "contact-form": { heading: "Get in Touch", subheading: "We'd love to hear from you", background: "white" },
  team:           { heading: "Meet the Team", subheading: "The people behind our success", background: "light" },
  stats:          { heading: "Our Numbers", background: "white" },
  video:          { heading: "", imageUrl: "", background: "dark" },
  spacer:         { paddingTop: "40", paddingBottom: "40", background: "white" },
};

// ─── Block canvas preview ─────────────────────────────────────────────────────

function BlockCanvas({ block }: { block: Block }) {
  const bgClass: Record<string, string> = {
    white:   "bg-white",
    light:   "bg-muted/30",
    dark:    "bg-foreground/80 text-background",
    primary: "bg-primary/80 text-primary-foreground",
  };
  const bg = bgClass[block.data.background ?? "white"] ?? "bg-white";

  if (block.type === "spacer") {
    return (
      <div className={`flex items-center justify-center ${bg}`} style={{ height: `${Number(block.data.paddingTop ?? 40) + Number(block.data.paddingBottom ?? 40)}px` }}>
        <span className="text-[10px] text-muted-foreground font-mono">spacer {block.data.paddingTop}px + {block.data.paddingBottom}px</span>
      </div>
    );
  }

  return (
    <div className={`px-6 py-6 ${bg} space-y-3`}>
      {block.data.heading && (
        <div className={`text-sm font-semibold text-center ${block.data.background === "dark" || block.data.background === "primary" ? "text-inherit" : "text-foreground"}`}>
          {block.data.heading}
        </div>
      )}
      {block.data.subheading && (
        <div className={`text-[12px] text-center ${block.data.background === "dark" || block.data.background === "primary" ? "text-inherit opacity-80" : "text-muted-foreground"}`}>
          {block.data.subheading}
        </div>
      )}

      {/* Block-specific preview */}
      {block.type === "hero" && (
        <div className="flex justify-center gap-2 mt-2">
          {block.data.buttonText && (
            <div className="rounded bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground">{block.data.buttonText}</div>
          )}
        </div>
      )}
      {block.type === "text" && block.data.body && (
        <p className="text-[11px] text-muted-foreground text-center line-clamp-2">{block.data.body}</p>
      )}
      {block.type === "features" && (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[1,2,3].map(i => <div key={i} className="text-center"><div className="mx-auto h-5 w-5 rounded bg-primary/20 mb-1" /><div className="h-1.5 w-full rounded bg-foreground/10" /></div>)}
        </div>
      )}
      {block.type === "product-grid" && (
        <div className={`grid gap-2 mt-1`} style={{ gridTemplateColumns: `repeat(${block.data.columns ?? 3}, 1fr)` }}>
          {Array.from({ length: Number(block.data.columns ?? 3) }).map((_, i) => (
            <div key={i} className="rounded border border-input overflow-hidden bg-card">
              <div className="h-8 bg-foreground/8" />
              <div className="p-1 space-y-0.5"><div className="h-1.5 w-full rounded bg-foreground/15" /><div className="h-1.5 w-2/3 rounded bg-primary/30" /></div>
            </div>
          ))}
        </div>
      )}
      {block.type === "testimonials" && (
        <div className="grid grid-cols-2 gap-2 mt-1">
          {[1,2].map(i => (
            <div key={i} className="rounded border border-input p-1.5 space-y-1 bg-card">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 text-amber-400 fill-amber-400" />)}</div>
              <div className="h-1.5 w-full rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      )}
      {block.type === "cta" && block.data.buttonText && (
        <div className="flex justify-center"><div className="rounded bg-background/20 border border-current/20 px-3 py-1 text-[10px]">{block.data.buttonText}</div></div>
      )}
      {block.type === "team" && (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[1,2,3].map(i => <div key={i} className="text-center"><div className="mx-auto h-8 w-8 rounded-full bg-foreground/15 mb-1" /><div className="h-1.5 w-full rounded bg-foreground/15" /></div>)}
        </div>
      )}
      {block.type === "stats" && (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[1,2,3].map(i => <div key={i} className="text-center"><div className="mx-auto h-4 w-10 rounded bg-primary/30 mb-1" /><div className="h-1.5 w-full rounded bg-foreground/10" /></div>)}
        </div>
      )}
      {block.type === "faq" && (
        <div className="space-y-1 mt-1">
          {[1,2,3].map(i => <div key={i} className="flex items-center justify-between rounded border border-input px-2 py-1 bg-card"><div className="h-1.5 w-3/4 rounded bg-foreground/15" /><ChevronDown className="h-3 w-3 text-muted-foreground" /></div>)}
        </div>
      )}
      {block.type === "contact-form" && (
        <div className="space-y-1.5 mt-1 max-w-[200px] mx-auto">
          {[1,2].map(i => <div key={i} className="h-6 w-full rounded border border-input bg-card" />)}
          <div className="h-10 w-full rounded border border-input bg-card" />
          <div className="h-6 w-20 rounded bg-primary/60" />
        </div>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls = "w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary";
const selectCls = "w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

function BlockSettings({ block, onChange }: { block: Block | null; onChange: (data: BlockData) => void }) {
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
        <Settings2 className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm font-medium">No block selected</p>
        <p className="text-[12px] mt-1">Click a block on the canvas to edit its settings</p>
      </div>
    );
  }

  const d = block.data;
  const set = (key: keyof BlockData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...d, [key]: e.target.value });

  const BG_OPTIONS = [
    { value: "white",   label: "White" },
    { value: "light",   label: "Light Gray" },
    { value: "dark",    label: "Dark" },
    { value: "primary", label: "Brand Color" },
  ];

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-input pb-2 mb-3">{block.label}</p>

      {/* Common fields */}
      {"heading" in d && (
        <Field label="Heading">
          <input className={inputCls} value={d.heading ?? ""} onChange={set("heading")} placeholder="Enter heading..." />
        </Field>
      )}
      {"subheading" in d && (
        <Field label="Subheading">
          <input className={inputCls} value={d.subheading ?? ""} onChange={set("subheading")} placeholder="Enter subheading..." />
        </Field>
      )}
      {block.type === "text" && (
        <Field label="Body Text">
          <textarea className={`${inputCls} resize-none`} rows={4} value={d.body ?? ""} onChange={set("body")} placeholder="Enter content..." />
        </Field>
      )}
      {(block.type === "hero" || block.type === "cta") && (
        <>
          <Field label="Button Text">
            <input className={inputCls} value={d.buttonText ?? ""} onChange={set("buttonText")} placeholder="e.g. Get Started" />
          </Field>
          <Field label="Button URL">
            <input className={inputCls} value={d.buttonUrl ?? ""} onChange={set("buttonUrl")} placeholder="/page-slug" />
          </Field>
        </>
      )}
      {block.type === "product-grid" && (
        <Field label="Columns">
          <select className={selectCls} value={d.columns ?? "3"} onChange={set("columns")}>
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>
        </Field>
      )}
      {block.type === "spacer" && (
        <>
          <Field label="Padding Top (px)">
            <input className={inputCls} type="number" value={d.paddingTop ?? "40"} onChange={set("paddingTop")} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <input className={inputCls} type="number" value={d.paddingBottom ?? "40"} onChange={set("paddingBottom")} min={0} max={200} />
          </Field>
        </>
      )}
      {block.type === "image" || block.type === "video" ? (
        <Field label={block.type === "video" ? "Video URL" : "Image URL"}>
          <input className={inputCls} value={d.imageUrl ?? ""} onChange={set("imageUrl")} placeholder="https://..." />
        </Field>
      ) : null}

      {/* Background */}
      <Field label="Background">
        <select className={selectCls} value={d.background ?? "white"} onChange={set("background")}>
          {BG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      {/* Padding */}
      {block.type !== "spacer" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Padding Top">
            <input className={inputCls} type="number" value={d.paddingTop ?? "48"} onChange={set("paddingTop")} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom">
            <input className={inputCls} type="number" value={d.paddingBottom ?? "48"} onChange={set("paddingBottom")} min={0} max={200} />
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── Sortable block row ───────────────────────────────────────────────────────

function SortableBlock({
  block, selected, onSelect, onDuplicate, onDelete, isFirst, isLast,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer transition-all ${selected ? "ring-2 ring-primary ring-inset" : "hover:ring-1 hover:ring-primary/40 hover:ring-inset"}`}
      onClick={onSelect}
    >
      {/* Block toolbar */}
      <div className={`absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 rounded-md border border-input bg-card shadow-sm px-1 py-0.5 transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <button
          {...attributes} {...listeners}
          className="rounded p-0.5 hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="rounded p-0.5 hover:bg-muted">
          <Copy className="h-3 w-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded p-0.5 hover:bg-destructive/10 text-destructive">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Block type label */}
      <div className={`absolute top-1.5 left-1.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-medium transition-opacity ${selected ? "bg-primary text-primary-foreground opacity-100" : "bg-foreground/10 text-foreground opacity-0 group-hover:opacity-100"}`}>
        {block.label}
      </div>

      <BlockCanvas block={block} />
    </div>
  );
}

// ─── Minus icon (inline) ─────────────────────────────────────────────────────

function Minus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Main builder ─────────────────────────────────────────────────────────────

const INITIAL_BLOCKS: Block[] = [
  { id: "b1", type: "hero",         label: "Hero Banner",    data: { ...DEFAULT_DATA["hero"] } },
  { id: "b2", type: "features",     label: "Features Grid",  data: { ...DEFAULT_DATA["features"] } },
  { id: "b3", type: "product-grid", label: "Product Grid",   data: { ...DEFAULT_DATA["product-grid"] } },
  { id: "b4", type: "testimonials", label: "Testimonials",   data: { ...DEFAULT_DATA["testimonials"] } },
  { id: "b5", type: "cta",          label: "Call to Action", data: { ...DEFAULT_DATA["cta"] } },
];

type ViewMode = "desktop" | "tablet" | "mobile";

export function PageBuilder({ pageId }: { pageId: string }) {
  const page   = websitePagesSeed.find((p) => p.id === pageId) ?? websitePagesSeed[0];
  const layout = mockWebsiteLayouts.find((l) => l.id === page.layoutId) ?? mockWebsiteLayouts[0];

  const [blocks, setBlocks]       = useState<Block[]>(INITIAL_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>("b1");
  const [viewMode, setViewMode]   = useState<ViewMode>("desktop");
  const [saved, setSaved]         = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function addBlock(type: BlockType, label: string) {
    const newBlock: Block = { id: `b${Date.now()}`, type, label, data: { ...DEFAULT_DATA[type] } };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  }

  function updateBlockData(data: BlockData) {
    setBlocks((prev) => prev.map((b) => b.id === selectedId ? { ...b, data } : b));
  }

  function duplicateBlock(id: string) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: `b${Date.now()}`, data: { ...prev[idx].data } };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === active.id);
        const to   = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, from, to);
      });
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const canvasWidth = viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "768px" : "390px";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-input bg-card px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild>
            <Link href="/website/pages"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">
              {layout.name} <span className="opacity-50">·</span> /{page.slug}
            </p>
            <p className="text-sm font-semibold leading-tight truncate">{page.title}</p>
          </div>
        </div>

        {/* Viewport toggles */}
        <div className="flex items-center gap-1 rounded-md border border-input bg-muted/40 p-0.5">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded px-2 py-1 transition-colors ${viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button size="sm" className="h-7 gap-1.5" onClick={handleSave}>
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — block library */}
        <div className="w-52 shrink-0 border-r border-input bg-card overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Blocks</p>
            <div className="space-y-3">
              {BLOCK_LIBRARY.map((cat) => (
                <div key={cat.category}>
                  <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5 px-1">{cat.category}</p>
                  <div className="space-y-0.5">
                    {cat.blocks.map((blk) => (
                      <button
                        key={blk.type}
                        onClick={() => addBlock(blk.type, blk.label)}
                        className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-left hover:bg-muted/60 transition-colors group"
                      >
                        <blk.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        <span className="truncate">{blk.label}</span>
                        <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center — canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-6 flex flex-col items-center">
          <div
            className="bg-card border border-input shadow-sm rounded-lg overflow-hidden transition-all duration-300"
            style={{ width: canvasWidth, maxWidth: "100%" }}
          >
            {/* Header stub */}
            <div className="h-10 bg-card border-b border-input flex items-center px-4 gap-3 shrink-0">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="h-1.5 w-10 rounded bg-foreground/10" />)}
              </div>
              <div className="ml-auto h-5 w-16 rounded bg-foreground/10" />
            </div>

            {/* DnD sortable blocks */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="min-h-[400px] divide-y divide-dashed divide-foreground/10">
                  {blocks.map((block, idx) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      selected={selectedId === block.id}
                      onSelect={() => setSelectedId(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      isFirst={idx === 0}
                      isLast={idx === blocks.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add block placeholder */}
            <div className="flex items-center justify-center py-5 border-t border-dashed border-foreground/10">
              <button
                className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-primary transition-colors"
                onClick={() => addBlock("text", "Rich Text")}
              >
                <Plus className="h-4 w-4" /> Add a block
              </button>
            </div>

            {/* Footer stub */}
            <div className="h-8 bg-muted/30 border-t border-input flex items-center px-4 gap-2">
              {[1,2,3].map(i => <div key={i} className="h-1.5 w-10 rounded bg-foreground/10" />)}
              <div className="ml-auto h-1.5 w-16 rounded bg-foreground/10" />
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div className="w-56 shrink-0 border-l border-input bg-card overflow-y-auto">
          <div className="border-b border-input px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Settings</p>
          </div>
          <BlockSettings block={selectedBlock} onChange={updateBlockData} />
        </div>
      </div>
    </div>
  );
}
