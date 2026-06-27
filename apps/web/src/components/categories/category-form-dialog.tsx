"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AgaincartClassicEditor } from "@/components/products/againcart-classic-editor";
import { MediaField } from "@/components/media/media-field";
import { SlugInput } from "@/components/ui/slug-input";
import type { Category } from "@/lib/mock-data/categories";
import { validateSlug } from "@/lib/url-slug/validate-slug";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  category?: Category | null;
  parentOptions: { id: string; label: string }[];
  defaultParentId?: string | null;
  onSave: (data: Partial<Category>) => void;
  /** Immediate store update while editing (grid sync live) */
  onLiveChange?: (data: Partial<Category> & { id: string }) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode = "create",
  category,
  parentOptions,
  defaultParentId,
  onSave,
  onLiveChange,
}: Props) {
  const [caption, setCaption] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [showInTopMenu, setShowInTopMenu] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | undefined>();
  const [bannerUrl, setBannerUrl] = useState<string | undefined>();
  const [iconMediaId, setIconMediaId] = useState<string | undefined>();
  const [bannerMediaId, setBannerMediaId] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setCaption(category?.caption ?? "");
      setSlug(category?.slug ?? "");
      setDescription(category?.description ?? "");
      setActive(category?.active ?? true);
      setShowInTopMenu(category?.showInTopMenu ?? false);
      setParentId(category?.parentId ?? defaultParentId ?? null);
      setIconUrl(category?.iconUrl);
      setBannerUrl(category?.bannerUrl);
      setIconMediaId(category?.iconMediaId);
      setBannerMediaId(category?.bannerMediaId);
    }
  }, [open, category, defaultParentId]);

  const pushLiveChange = useCallback(
    (next: {
      caption?: string;
      active?: boolean;
      showInTopMenu?: boolean;
      parentId?: string | null;
    }) => {
      if (mode === "edit" && category?.id && onLiveChange) {
        onLiveChange({
          id: category.id,
          caption: next.caption ?? caption,
          active: next.active ?? active,
          showInTopMenu: next.showInTopMenu ?? showInTopMenu,
          parentId: (next.parentId !== undefined ? next.parentId : parentId) ?? null,
        });
      }
    },
    [category, caption, active, showInTopMenu, parentId, mode, onLiveChange],
  );

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    pushLiveChange({ caption: value });
  };

  const handleActiveChange = (value: boolean) => {
    setActive(value);
    pushLiveChange({ active: value });
  };

  const handleTopMenuChange = (value: boolean) => {
    setShowInTopMenu(value);
    pushLiveChange({ showInTopMenu: value });
  };

  const handleParentChange = (value: string) => {
    const next = value || null;
    setParentId(next);
    pushLiveChange({ parentId: next });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const slugValidation = validateSlug(slug, category?.id ? { id: category.id } : undefined);
    if (slug.trim() && !slugValidation.isValid) {
      toast.error(slugValidation.message ?? "Invalid slug");
      return;
    }
    const fd = new FormData(e.currentTarget);
    onSave({
      name: String(fd.get("name") ?? ""),
      caption,
      slug,
      parentId,
      active,
      showInTopMenu,
      description,
      metaTitle: String(fd.get("metaTitle") ?? ""),
      metaDescription: String(fd.get("metaDescription") ?? ""),
      metaKeywords: String(fd.get("metaKeywords") ?? ""),
      iconUrl,
      bannerUrl,
      iconMediaId,
      bannerMediaId,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-xl gap-0 overflow-hidden p-0 sm:max-w-xl [&>button.absolute]:hidden"
        aria-describedby={undefined}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-input px-5 py-4">
            <p className="text-base font-semibold">
              {mode === "create" ? "Add Category" : "Edit Category"}
            </p>
            <button
              type="button"
              className="rounded-md p-1 hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  General
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" hint="Full category name" required>
                    <Input
                      name="name"
                      required
                      defaultValue={category?.name}
                      placeholder="HP Laptop"
                    />
                  </Field>
                  <Field label="Caption" hint="Menu label — e.g. HP">
                    <Input
                      name="caption"
                      value={caption}
                      onChange={(e) => handleCaptionChange(e.target.value)}
                      placeholder="HP"
                    />
                  </Field>
                  <Field label="Slug" hint="SEO URL" required className="sm:col-span-2">
                    <SlugInput
                      value={slug}
                      onChange={setSlug}
                      excludeId={category?.id}
                      urlPrefix={<span className="shrink-0 text-muted-foreground">/</span>}
                      required
                      placeholder="laptops"
                    />
                  </Field>
                  <Field label="Parent" className="sm:col-span-2">
                    <Select
                      name="parentId"
                      value={parentId ?? ""}
                      onChange={(e) => handleParentChange(e.target.value)}
                    >
                      <option value="">— Root (no parent) —</option>
                      {parentOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h3>
                <AgaincartClassicEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Category page description…"
                  minRows={5}
                  aiContext="category.description"
                  aiVariables={{ category_name: caption }}
                />
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SEO
                </h3>
                <div className="space-y-3">
                  <Field label="Meta title">
                    <Input name="metaTitle" defaultValue={category?.metaTitle} placeholder="HP Laptops — Shop Online" />
                  </Field>
                  <Field label="Meta description">
                    <Textarea
                      name="metaDescription"
                      rows={2}
                      defaultValue={category?.metaDescription}
                      placeholder="Buy HP laptops at best price…"
                    />
                  </Field>
                  <Field label="Meta keywords">
                    <Input
                      name="metaKeywords"
                      defaultValue={category?.metaKeywords}
                      placeholder="hp, laptop, notebook"
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Media
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Icon" hint="Category image">
                    <MediaField
                      value={iconUrl}
                      mediaId={iconMediaId}
                      onChange={(item) => {
                        setIconMediaId(item?.id);
                        setIconUrl(item?.url);
                      }}
                      aspect="square"
                      emptyLabel="Add icon"
                      modalTitle="Select category icon"
                    />
                  </Field>
                  <Field label="Banner" hint="Shown on category page if set">
                    <MediaField
                      value={bannerUrl}
                      mediaId={bannerMediaId}
                      onChange={(item) => {
                        setBannerMediaId(item?.id);
                        setBannerUrl(item?.url);
                      }}
                      aspect="banner"
                      emptyLabel="Add banner"
                      modalTitle="Select category banner"
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Settings
                </h3>
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Changes apply live to the grid — no need to save first.
                </p>
                <div className="space-y-2">
                  <Switch
                    checked={showInTopMenu}
                    onCheckedChange={handleTopMenuChange}
                    label="Website menu"
                    description="Yes = website er top menu te Caption diye dekhabe · No = dekhabe na"
                  />
                  <Switch
                    checked={active}
                    onCheckedChange={handleActiveChange}
                    label="Status"
                    description="On = Active (category live) · Off = Inactive (storefront theke hidden)"
                  />
                </div>
              </section>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-input px-5 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {mode === "create" ? "Create category" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
