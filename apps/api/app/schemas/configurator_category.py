from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.configurator_profile import ConfiguratorStatus

SelectionMode = Literal["single", "multiple"]


class ConfiguratorCategoryBase(BaseModel):
    profile_id: str = Field(min_length=1, max_length=36)
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    sort_order: int = 0
    is_required: bool = False
    selection_mode: SelectionMode = "single"
    status: ConfiguratorStatus = "draft"


class ConfiguratorCategoryCreate(ConfiguratorCategoryBase):
    pass


class ConfiguratorCategoryUpdate(BaseModel):
    profile_id: Optional[str] = Field(default=None, min_length=1, max_length=36)
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_required: Optional[bool] = None
    selection_mode: Optional[SelectionMode] = None
    status: Optional[ConfiguratorStatus] = None


class ConfiguratorCategoryRead(ConfiguratorCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    profile_name: str = ""
    product_count: int = 0
    created_at: datetime
    updated_at: datetime


class ConfiguratorCategoryListMeta(BaseModel):
    count: int


class ConfiguratorCategoryListResponse(BaseModel):
    data: List[ConfiguratorCategoryRead]
    meta: ConfiguratorCategoryListMeta
    errors: List[str] = []


class ConfiguratorCategoryResponse(BaseModel):
    data: ConfiguratorCategoryRead
    errors: List[str] = []


class ConfiguratorCategoryBulkStatusRequest(BaseModel):
    ids: List[str] = Field(min_length=1)
    status: ConfiguratorStatus
