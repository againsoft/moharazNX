"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  BUNDLE_PRICING_LABELS,
  type BundlePricingMode,
  type BundleStatus,
  type ProductBundle,
} from "@/lib/mock-data/bundles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SlugInput } from "@/components/ui/slug-input";
import { validateSlug } from "@/lib/url-slug/validate-slug";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  bundle?: ProductBundle | null;
  onSave: (data: Partial<ProductBundle>) => void;
};

const STATUSES: BundleStatus[] = ["draft", "published", "archived"];
const PRICING_MODES: BundlePricingMode[] = ["fixed", "sum_discount"];

export function BundleFormDialog({
  open,
  onOpenChange,
  mode = "create",
  bundle,
  onSave,
}: Props) {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<BundleStatus>("draft");
  const [pricingMode, setPricingMode] = useState<BundlePricingMode>("sum_discount");
  const [discountPercent, setDiscountPercent] = useState(10);

  useEffect(() => {
    if (open) {
      setSlug(bundle?.slug ?? "");
      setStatus(bundle?.status ?? "draft");
      setPricingMode(bundle?.pricingMode ?? "sum_discount");
      setDiscountPercent(bundle?.discountPercent ?? 10);
    }
  }, [open, bundle]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const slugValidation = validateSlug(slug, bundle?.id ? { id: bundle.id } : undefined);
    if (slug.trim() && !slugValidation.isValid) {
      toast.error(slugValidation.message ?? "Invalid slug");
      return;
    }
    const fd = new FormData(e.currentTarget);
    onSave({
      name: String(fd.get("name") ?? ""),
      slug,
      sku: String(fd.get("sku") ?? ""),
      status,
      pricingMode,
      bundlePrice: Number(fd.get("bundlePrice") ?? 0),
      discountPercent,
      category: String(fd.get("category") ?? "General"),
      description: String(fd.get("description") ?? "") || undefined,
      thumbnail: String(fd.get("thumbnail") ?? "") || undefined,
      components: bundle?.components ?? [],
    });
    toast.success(mode === "create" ? "Bundle created (mock)" : "Bundle updated (mock)");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[min(640px,95vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-input bg-background shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-input px-5 py-4">
            <Dialog.Title className="text-base font-semibold">
              {mode === "create" ? "Add Bundle" : "Edit Bundle"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="bnd-name">Name</Label>
                <Input id="bnd-name" name="name" defaultValue={bundle?.name} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <SlugInput value={slug} onChange={setSlug} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bnd-sku">SKU</Label>
                  <Input id="bnd-sku" name="sku" defaultValue={bundle?.sku} required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as BundleStatus)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bnd-category">Category</Label>
                  <Input id="bnd-category" name="category" defaultValue={bundle?.category ?? "General"} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pricing mode</Label>
                  <Select
                    value={pricingMode}
                    onChange={(e) => setPricingMode(e.target.value as BundlePricingMode)}
                  >
                    {PRICING_MODES.map((m) => (
                      <option key={m} value={m}>
                        {BUNDLE_PRICING_LABELS[m]}
                      </option>
                    ))}
                  </Select>
                </div>
                {pricingMode === "fixed" ? (
                  <div className="space-y-2">
                    <Label htmlFor="bundlePrice">Fixed bundle price (৳)</Label>
                    <Input
                      id="bundlePrice"
                      name="bundlePrice"
                      type="number"
                      min={0}
                      defaultValue={bundle?.bundlePrice ?? 0}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Discount (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnd-thumb">Thumbnail URL</Label>
                <Input id="bnd-thumb" name="thumbnail" defaultValue={bundle?.thumbnail} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnd-desc">Description</Label>
                <Textarea id="bnd-desc" name="description" rows={2} defaultValue={bundle?.description} />
              </div>

              {mode === "edit" && bundle && bundle.components.length > 0 && (
                <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  {bundle.componentCount} components — manage items in bundle detail view (prototype).
                </p>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-input px-5 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Create" : "Save"}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
