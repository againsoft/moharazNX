"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { buildRfqDraft } from "@/lib/mock-data/purchase-rfq";
import { suppliersSeed } from "@/lib/mock-data/suppliers";
import { usePurchaseRfqStore } from "@/lib/store/purchase-rfq-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LineDraft = { key: string; sku: string; name: string; quantity: number };

const emptyLine = (): LineDraft => ({
  key: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  sku: "",
  name: "",
  quantity: 1,
});

export function RfqForm() {
  const router = useRouter();
  const addRfq = usePurchaseRfqStore((s) => s.addRfq);
  const updateStatus = usePurchaseRfqStore((s) => s.updateStatus);

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("2026-07-15");
  const [notes, setNotes] = useState("");
  const [invited, setInvited] = useState<string[]>(["sup_001"]);
  const [lines, setLines] = useState<LineDraft[]>([
    { key: "line_1", sku: "SKU-0002", name: "Wireless Earbuds Pro", quantity: 500 },
  ]);

  const toggleVendor = (id: string) => {
    setInvited((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const save = (send: boolean) => {
    if (!title.trim()) {
      toast.error("Enter RFQ title");
      return;
    }
    if (invited.length === 0) {
      toast.error("Invite at least one vendor");
      return;
    }
    if (lines.some((l) => !l.name.trim())) {
      toast.error("Complete all line items");
      return;
    }

    const draft = buildRfqDraft({
      title,
      deadline,
      notes: notes.trim() || undefined,
      invitedSupplierIds: invited,
      lines: lines.map((l) => ({
        sku: l.sku || `SKU-${Date.now()}`,
        name: l.name,
        quantity: l.quantity,
      })),
    });

    addRfq(draft);
    if (send) {
      updateStatus(draft.id, "sent");
      toast.success("RFQ sent to vendors");
    } else {
      toast.success("RFQ saved as draft");
    }
    router.push(`/suppliers/rfq/${draft.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
        <Link href="/suppliers/rfq">
          <ArrowLeft className="mr-1 h-4 w-4" /> RFQ list
        </Link>
      </Button>

      <div>
        <h2 className="text-base font-semibold">New request for quotation</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Invite vendors, define lines, and compare quotes before creating a PO.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rfq-title">Title</Label>
          <Input
            id="rfq-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wireless earbuds — Q3 restock"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rfq-deadline">Response deadline</Label>
          <Input
            id="rfq-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rfq-notes">Notes</Label>
          <Input
            id="rfq-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal sourcing notes"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Invite vendors</Label>
        <div className="flex flex-wrap gap-2">
          {suppliersSeed.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={s.status === "blocked"}
              onClick={() => toggleVendor(s.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                invited.includes(s.id)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/50"
              } ${s.status === "blocked" ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">RFQ lines</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setLines((l) => [...l, emptyLine()])}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add line
          </Button>
        </div>
        {lines.map((line) => (
          <div
            key={line.key}
            className="grid gap-2 rounded-lg border border-input bg-card p-3 sm:grid-cols-12"
          >
            <div className="sm:col-span-5">
              <Label className="text-[10px]">Product</Label>
              <Input
                value={line.name}
                onChange={(e) =>
                  setLines((rows) =>
                    rows.map((r) => (r.key === line.key ? { ...r, name: e.target.value } : r)),
                  )
                }
                className="mt-0.5 h-8 text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="text-[10px]">SKU</Label>
              <Input
                value={line.sku}
                onChange={(e) =>
                  setLines((rows) =>
                    rows.map((r) => (r.key === line.key ? { ...r, sku: e.target.value } : r)),
                  )
                }
                className="mt-0.5 h-8 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-[10px]">Qty</Label>
              <Input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setLines((rows) =>
                    rows.map((r) =>
                      r.key === line.key ? { ...r, quantity: Number(e.target.value) || 1 } : r,
                    ),
                  )
                }
                className="mt-0.5 h-8 text-xs"
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              {lines.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => setLines((rows) => rows.filter((r) => r.key !== line.key))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-input pt-4">
        <Button variant="outline" onClick={() => save(false)}>
          Save draft
        </Button>
        <Button onClick={() => save(true)}>Save & send</Button>
        <Button variant="ghost" asChild>
          <Link href="/suppliers/rfq">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
