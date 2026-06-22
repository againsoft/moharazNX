"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Plus, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  generateMatrixRows,
  getPresetDimensions,
  type VariantDimension,
  type VariantMatrixRow,
} from "@/lib/mock-data/variants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  productType: "simple" | "variable";
  onProductTypeChange: (type: "simple" | "variable") => void;
  baseSku: string;
  basePrice: string;
  category?: string;
};

function parseValues(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProductVariantEditor({
  productType,
  onProductTypeChange,
  baseSku,
  basePrice,
  category,
}: Props) {
  const [dimensions, setDimensions] = useState<VariantDimension[]>(() => getPresetDimensions(category));
  const [rows, setRows] = useState<VariantMatrixRow[]>([]);
  const [matrixGenerated, setMatrixGenerated] = useState(false);

  const basePriceNum = Number(basePrice) || 0;

  useEffect(() => {
    if (productType === "variable" && !matrixGenerated) {
      setDimensions(getPresetDimensions(category));
    }
  }, [category, productType, matrixGenerated]);

  const dimensionSummary = useMemo(() => {
    const active = dimensions.filter((d) => d.name.trim() && d.values.length > 0);
    if (active.length === 0) return "Add at least one dimension with values.";
    return active.map((d) => `${d.name}: ${d.values.join(", ")}`).join(" · ");
  }, [dimensions]);

  const updateDimension = (id: string, patch: Partial<VariantDimension>) => {
    setDimensions((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    setMatrixGenerated(false);
  };

  const addDimension = () => {
    setDimensions((prev) => [
      ...prev,
      { id: `dim_${Date.now()}`, name: "", values: [] },
    ]);
    setMatrixGenerated(false);
  };

  const removeDimension = (id: string) => {
    setDimensions((prev) => prev.filter((d) => d.id !== id));
    setMatrixGenerated(false);
  };

  const generateMatrix = () => {
    const active = dimensions.filter((d) => d.name.trim() && d.values.length > 0);
    if (active.length === 0) {
      toast.error("Add dimension names and comma-separated values first.");
      return;
    }
    const next = generateMatrixRows(active, baseSku, basePriceNum);
    setRows(next);
    setMatrixGenerated(true);
    toast.success(`Generated ${next.length} variant${next.length === 1 ? "" : "s"}`);
  };

  const updateRow = (id: string, patch: Partial<VariantMatrixRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const setDefaultRow = (id: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, isDefault: r.id === id })));
  };

  return (
    <div className="space-y-4">
      <Field
        label="Product type"
        hint="Simple = one sellable SKU. Variable = parent is not sold; only generated variants are purchasable."
      >
        <div className="flex flex-wrap gap-2">
          {(["simple", "variable"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={productType === t ? "default" : "outline"}
              onClick={() => onProductTypeChange(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </Field>

      {productType === "simple" ? (
        <div className="rounded-md border border-dashed border-input bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
          Parent SKU <span className="font-mono text-foreground">{baseSku || "—"}</span> is the sellable unit.
          Price and stock are managed in Pricing and Inventory sections.
        </div>
      ) : (
        <>
          <div className="rounded-md border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            Variant dimensions (Color, Size, Storage) are <strong>not</strong> specification fields.
            Technical specs live in the Specifications tab — see catalog architecture.
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Variant dimensions</p>
              <Button type="button" variant="outline" size="sm" onClick={addDimension}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add dimension
              </Button>
            </div>

            {dimensions.map((dim) => (
              <div key={dim.id} className="grid gap-2 rounded-md border border-input p-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
                <Field label="Dimension">
                  <Input
                    value={dim.name}
                    onChange={(e) => updateDimension(dim.id, { name: e.target.value })}
                    placeholder="e.g. Color"
                    className="h-8"
                  />
                </Field>
                <Field label="Values (comma-separated)" hint="Used to build the variant matrix">
                  <Input
                    value={dim.values.join(", ")}
                    onChange={(e) => updateDimension(dim.id, { values: parseValues(e.target.value) })}
                    placeholder="Black, White, Red"
                    className="h-8"
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeDimension(dim.id)}
                  aria-label={`Remove ${dim.name || "dimension"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <p className="text-xs text-muted-foreground">{dimensionSummary}</p>

            <Button type="button" size="sm" onClick={generateMatrix}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Generate variant matrix
            </Button>
          </div>

          {rows.length > 0 && (
            <>
              <div className="space-y-2 md:hidden">
                {rows.map((row) => (
                  <div key={row.id} className="rounded-md border border-input p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{row.label}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant={row.isDefault ? "default" : "outline"}
                        className="h-7 px-2"
                        onClick={() => setDefaultRow(row.id)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Field label="SKU">
                        <Input
                          className="h-8 font-mono text-xs"
                          value={row.sku}
                          onChange={(e) => updateRow(row.id, { sku: e.target.value })}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Price">
                          <Input
                            className="h-8"
                            type="number"
                            value={row.price}
                            onChange={(e) => updateRow(row.id, { price: Number(e.target.value) || 0 })}
                          />
                        </Field>
                        <Field label="Stock">
                          <Input
                            className="h-8"
                            type="number"
                            value={row.stock}
                            onChange={(e) => updateRow(row.id, { stock: Number(e.target.value) || 0 })}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-md border border-input md:block">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Variant</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="w-16 px-3 py-2">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-input">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{row.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 font-mono text-xs"
                            value={row.sku}
                            onChange={(e) => updateRow(row.id, { sku: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 w-28"
                            type="number"
                            value={row.price}
                            onChange={(e) => updateRow(row.id, { price: Number(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 w-20"
                            type="number"
                            value={row.stock}
                            onChange={(e) => updateRow(row.id, { stock: Number(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant={row.isDefault ? "default" : "outline"}
                            className="h-7 w-7 p-0"
                            onClick={() => setDefaultRow(row.id)}
                            aria-label={`Set ${row.label} as default`}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">
                {rows.length} sellable SKU{rows.length === 1 ? "" : "s"} · default variant shows first on storefront (
                {formatCurrency(rows.find((r) => r.isDefault)?.price ?? rows[0]?.price ?? 0)})
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
