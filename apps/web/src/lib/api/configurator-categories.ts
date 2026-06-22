import type { ConfiguratorCategory } from "@/lib/configurator/types";

export type ApiConfiguratorCategory = {
  id: string;
  company_id: string;
  profile_id: string;
  profile_name: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_required: boolean;
  selection_mode: ConfiguratorCategory["selectionMode"];
  product_count: number;
  status: ConfiguratorCategory["status"];
  created_at: string;
  updated_at: string;
};

export type ApiConfiguratorCategoryListResponse = {
  data: ApiConfiguratorCategory[];
  meta: { count: number };
  errors: string[];
};

export type ApiConfiguratorCategoryResponse = {
  data: ApiConfiguratorCategory;
  errors: string[];
};

export function apiCategoryToConfiguratorCategory(row: ApiConfiguratorCategory): ConfiguratorCategory {
  return {
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile_name,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    isRequired: row.is_required,
    selectionMode: row.selection_mode,
    productCount: row.product_count,
    status: row.status,
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export type CreateConfiguratorCategoryInput = {
  profileId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  isRequired?: boolean;
  selectionMode?: ConfiguratorCategory["selectionMode"];
  status?: ConfiguratorCategory["status"];
};

export type UpdateConfiguratorCategoryInput = Partial<CreateConfiguratorCategoryInput>;

function categoryInputToApiPayload(
  input: CreateConfiguratorCategoryInput | UpdateConfiguratorCategoryInput,
) {
  const payload: Record<string, unknown> = {};
  if ("profileId" in input && input.profileId !== undefined) payload.profile_id = input.profileId;
  if ("name" in input && input.name !== undefined) payload.name = input.name;
  if ("slug" in input && input.slug !== undefined) payload.slug = input.slug;
  if ("description" in input && input.description !== undefined) payload.description = input.description;
  if ("sortOrder" in input && input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if ("isRequired" in input && input.isRequired !== undefined) payload.is_required = input.isRequired;
  if ("selectionMode" in input && input.selectionMode !== undefined) {
    payload.selection_mode = input.selectionMode;
  }
  if ("status" in input && input.status !== undefined) payload.status = input.status;
  return payload;
}

export function categoryToApiCreatePayload(input: CreateConfiguratorCategoryInput) {
  return categoryInputToApiPayload(input);
}

export function categoryToApiUpdatePayload(input: UpdateConfiguratorCategoryInput) {
  return categoryInputToApiPayload(input);
}

export function partialCategoryToApiUpdate(
  data: Partial<ConfiguratorCategory>,
): UpdateConfiguratorCategoryInput {
  const input: UpdateConfiguratorCategoryInput = {};
  if (data.profileId !== undefined) input.profileId = data.profileId;
  if (data.name !== undefined) input.name = data.name;
  if (data.slug !== undefined) input.slug = data.slug;
  if (data.description !== undefined) input.description = data.description;
  if (data.sortOrder !== undefined) input.sortOrder = data.sortOrder;
  if (data.isRequired !== undefined) input.isRequired = data.isRequired;
  if (data.selectionMode !== undefined) input.selectionMode = data.selectionMode;
  if (data.status !== undefined) input.status = data.status;
  return input;
}
