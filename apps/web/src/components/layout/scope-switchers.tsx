"use client";

import { branches, companies } from "@/lib/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  companyClassName?: string;
  branchClassName?: string;
};

const selectClass =
  "h-8 truncate rounded-md border border-input bg-background px-2 text-[11px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CompanySwitcher({ className, companyClassName }: Pick<Props, "className" | "companyClassName">) {
  const companyId = useAppStore((s) => s.companyId);
  const setCompany = useAppStore((s) => s.setCompany);

  return (
    <select
      aria-label="Company"
      className={cn(selectClass, "max-w-[128px]", companyClassName, className)}
      value={companyId}
      onChange={(e) => setCompany(e.target.value)}
    >
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function BranchSwitcher({ className, branchClassName }: Pick<Props, "className" | "branchClassName">) {
  const companyId = useAppStore((s) => s.companyId);
  const branchId = useAppStore((s) => s.branchId);
  const setBranch = useAppStore((s) => s.setBranch);
  const branchList = branches.filter((b) => b.companyId === companyId);

  return (
    <select
      aria-label="Branch"
      className={cn(selectClass, "max-w-[108px]", branchClassName, className)}
      value={branchId}
      onChange={(e) => setBranch(e.target.value)}
    >
      {branchList.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}

export function ScopeSwitchers({ className }: Pick<Props, "className">) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <CompanySwitcher className="hidden lg:block" />
      <BranchSwitcher className="hidden sm:block" />
    </div>
  );
}
