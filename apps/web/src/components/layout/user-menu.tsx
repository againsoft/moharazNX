"use client";

import Link from "next/link";
import { LogOut, Settings, User, UserCircle } from "lucide-react";
import { BranchSwitcher, CompanySwitcher } from "@/components/layout/scope-switchers";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { companies } from "@/lib/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const companyId = useAppStore((s) => s.companyId);
  const company = companies.find((c) => c.id === companyId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-1.5 rounded-full border border-input px-1.5 py-0.5 text-[11px]"
          aria-label="User menu"
          aria-haspopup="menu"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            AD
          </span>
          <span className="hidden max-w-[96px] truncate sm:inline">{company?.name?.split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span>Admin User</span>
            <span className="text-[11px] font-normal text-muted-foreground">{company?.name}</span>
          </div>
        </DropdownMenuLabel>
        <div className="space-y-2 px-2 py-1.5 lg:hidden">
          <CompanySwitcher className="w-full max-w-none" companyClassName="w-full max-w-none" />
          <BranchSwitcher className="w-full max-w-none" branchClassName="w-full max-w-none" />
        </div>
        <DropdownMenuSeparator className="lg:hidden" />
        <ThemeSwitch variant="menu" />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" aria-hidden />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ess" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" aria-hidden />
            Employee portal (ESS)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" aria-hidden />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
