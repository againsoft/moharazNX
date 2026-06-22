"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { SLUG_INPUT_INVALID_CLASS, validateSlug } from "@/lib/url-slug/validate-slug";
import { cn } from "@/lib/utils";

type SlugInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "prefix"> & {
  value: string;
  onChange: (value: string) => void;
  excludeId?: string;
  urlPrefix?: React.ReactNode;
  showMessage?: boolean;
};

export function SlugInput({
  value,
  onChange,
  excludeId,
  urlPrefix,
  showMessage = true,
  className,
  ...props
}: SlugInputProps) {
  const validation = validateSlug(value, excludeId ? { id: excludeId } : undefined);
  const invalid = !!value.trim() && !validation.isValid;

  return (
    <div className="min-w-0">
      <div className={cn("flex items-center gap-1 text-sm", urlPrefix && "gap-1")}>
        {urlPrefix}
        <Input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("min-w-0 flex-1", invalid && SLUG_INPUT_INVALID_CLASS, className)}
          aria-invalid={invalid}
        />
      </div>
      {showMessage && invalid && validation.message && (
        <p className="mt-1 text-[10px] text-destructive">{validation.message}</p>
      )}
    </div>
  );
}

export function useSlugValidation(slug: string, excludeId?: string) {
  return React.useMemo(
    () => validateSlug(slug, excludeId ? { id: excludeId } : undefined),
    [slug, excludeId],
  );
}
