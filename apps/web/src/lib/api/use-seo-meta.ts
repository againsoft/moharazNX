"use client";

import { useCallback, useEffect, useState } from "react";
import type { SeoMetaRecord } from "@/lib/mock-data/seo";
import { apiFetch } from "@/lib/api/client";
import { apiSeoMetaToRecord, type ApiSeoMetaListResponse } from "@/lib/api/seo-meta";

export function useSeoMeta() {
  const [records, setRecords] = useState<SeoMetaRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiSeoMetaListResponse>("/api/v1/seo/meta");
      setRecords(res.data.map(apiSeoMetaToRecord));
      setTotal(res.meta.count);
      setAvgScore(res.meta.avg_score);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEO meta");
      setRecords([]);
      setTotal(0);
      setAvgScore(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { records, total, avgScore, loading, error, refetch };
}
