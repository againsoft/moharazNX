import type { StockItem, StockStatus, Warehouse } from "@/lib/mock-data/inventory";
import { apiFetch } from "@/lib/api/client";

export type ApiWarehouse = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  type: string;
  address: string | null;
  locations_count: number;
  is_active: boolean;
  sort_order: number;
  total_units: number;
  created_at: string;
  updated_at: string;
};

export type ApiWarehouseListResponse = {
  data: ApiWarehouse[];
  meta: { count: number };
};

export type ApiWarehouseResponse = {
  data: ApiWarehouse;
};

export type ApiStockLevel = {
  id: string;
  company_id: string;
  warehouse_id: string;
  warehouse_name: string;
  variant_id: string;
  product_id: string;
  sku: string;
  name: string;
  on_hand: number;
  reserved: number;
  available: number;
  incoming: number;
  min_qty: number;
  max_qty: number;
  unit_cost: string;
  status: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiStockListResponse = {
  data: ApiStockLevel[];
  meta: {
    count: number;
    total_units: number;
    total_value: string;
  };
};

export type ApiStockResponse = {
  data: ApiStockLevel;
};

export type StockListParams = {
  search?: string;
  warehouse?: string;
  warehouse_id?: string;
  product_id?: string;
  status?: string;
};

export function apiWarehouseToWarehouse(row: ApiWarehouse): Warehouse {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    address: row.address ?? "",
    locations: row.locations_count,
    totalUnits: row.total_units,
    active: row.is_active,
  };
}

export function apiStockToStockItem(row: ApiStockLevel): StockItem {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    warehouse: row.warehouse_name,
    onHand: row.on_hand,
    reserved: row.reserved,
    available: row.available,
    incoming: row.incoming,
    minQty: row.min_qty,
    maxQty: row.max_qty,
    status: row.status as StockStatus,
    unitCost: Number(row.unit_cost),
    updatedAt: row.updated_at.slice(0, 10),
    thumbnail: row.thumbnail ?? undefined,
  };
}

export function buildStockQuery(params?: StockListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.warehouse) q.set("warehouse", params.warehouse);
  if (params.warehouse_id) q.set("warehouse_id", params.warehouse_id);
  if (params.product_id) q.set("product_id", params.product_id);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateStockLevelInput = {
  onHand?: number;
  reserved?: number;
  incoming?: number;
  minQty?: number;
  maxQty?: number;
  unitCost?: number;
};

export function stockUpdateToApiPayload(input: UpdateStockLevelInput) {
  return {
    on_hand: input.onHand,
    reserved: input.reserved,
    incoming: input.incoming,
    min_qty: input.minQty,
    max_qty: input.maxQty,
    unit_cost: input.unitCost,
  };
}

/** Load stock levels for a catalog product from the Inventory module API. */
export async function fetchProductStockLevels(productId: string): Promise<ApiStockLevel[]> {
  const res = await apiFetch<ApiStockListResponse>(
    `/api/v1/inventory/stock${buildStockQuery({ product_id: productId })}`,
  );
  return res.data;
}
