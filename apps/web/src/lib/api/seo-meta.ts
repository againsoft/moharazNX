import type { SchemaType, SeoEntityType, SeoMetaRecord } from "@/lib/mock-data/seo";

export type ApiSeoMeta = {
  id: string;
  entity_type: string;
  title: string;
  url: string;
  meta_title: string;
  meta_description: string;
  og_image: string | null;
  canonical_url: string | null;
  indexable: boolean;
  schema_type: string;
  score: number;
  issues: string[];
};

export type ApiSeoMetaListResponse = {
  data: ApiSeoMeta[];
  meta: { count: number; avg_score: number };
};

export function apiSeoMetaToRecord(row: ApiSeoMeta): SeoMetaRecord {
  return {
    id: row.id,
    entityType: row.entity_type as SeoEntityType,
    title: row.title,
    url: row.url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image ?? "",
    canonicalUrl: row.canonical_url ?? "",
    indexable: row.indexable,
    schemaType: row.schema_type as SchemaType,
    score: row.score,
    issues: row.issues ?? [],
  };
}

export function buildSeoMetaQuery(params?: { search?: string; entity_type?: string }): string {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.entity_type) q.set("entity_type", params.entity_type);
  const s = q.toString();
  return s ? `?${s}` : "";
}
