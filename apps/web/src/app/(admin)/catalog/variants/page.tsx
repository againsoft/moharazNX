import { VariantCatalogList } from "@/components/variants/variant-catalog-list";

export default function Page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Variants</p>
        <h1 className="page-title">Variants</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Global list of sellable SKUs — variable product children and simple product defaults.
          Matrix editing happens in Product form → Variants tab.
        </p>
      </div>
      <VariantCatalogList />
    </div>
  );
}
