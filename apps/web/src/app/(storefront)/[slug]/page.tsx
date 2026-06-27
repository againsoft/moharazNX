import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailPageClient } from "@/components/storefront/product/product-detail-page-client";
import { resolveStorefrontSlug } from "@/lib/url-slug/resolver";
import { CatalogView } from "@/components/storefront/catalog/catalog-view";
import { getStorefrontProductDetail } from "@/lib/mock-data/storefront-product";
import { isAdminPath } from "@/lib/theme/is-storefront-path";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveStorefrontSlug(slug);
  if (!resolved) return { title: "Not found" };

  switch (resolved.type) {
    case "category":
      return {
        title: `${resolved.category.metaTitle ?? resolved.category.name} — MoharazNX`,
        description: resolved.category.metaDescription ?? resolved.category.description,
      };
    case "brand":
      return {
        title: `${resolved.brand.metaTitle ?? resolved.brand.name} — MoharazNX`,
        description: resolved.brand.metaDescription ?? resolved.brand.description,
      };
    case "product": {
      const detail = getStorefrontProductDetail(resolved.product.slug);
      return {
        title: `${resolved.product.name} — MoharazNX`,
        description: detail?.product.description,
      };
    }
    case "page":
      return {
        title: `${resolved.page.metaTitle ?? resolved.page.title} — MoharazNX`,
        description: resolved.page.metaDescription,
      };
  }
}

export default async function FlatSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/${slug}`;

  if (isAdminPath(path)) {
    permanentRedirect(path);
  }

  const resolved = resolveStorefrontSlug(slug);

  if (!resolved) {
    return <ProductDetailPageClient slug={slug} />;
  }

  if (resolved.type === "category") {
    return (
      <Suspense fallback={null}>
        <CatalogView categorySlug={resolved.category.slug} />
      </Suspense>
    );
  }

  if (resolved.type === "brand") {
    return (
      <Suspense fallback={null}>
        <CatalogView brandSlug={resolved.brand.slug} />
      </Suspense>
    );
  }

  if (resolved.type === "product") {
    return (
      <ProductDetailPageClient slug={resolved.product.slug} initialProduct={resolved.product} />
    );
  }

  if (resolved.type === "page") {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="mb-6 text-2xl font-bold">{resolved.page.title}</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          {resolved.page.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    );
  }

  notFound();
}
