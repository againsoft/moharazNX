"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NOTIFICATION_PREVIEW = [
  { id: "1", title: "Leave request pending", meta: "2m ago · HR" },
  { id: "2", title: "Payroll run awaiting approval", meta: "1h ago · Payroll" },
  { id: "3", title: "Attendance correction submitted", meta: "3h ago · Attendance" },
] as const;

export function NotificationCenter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-medium text-white">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATION_PREVIEW.map((item) => (
          <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-0.5 py-2">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-[11px] text-muted-foreground">{item.meta}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full cursor-pointer">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
