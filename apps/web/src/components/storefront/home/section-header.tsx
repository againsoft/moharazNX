import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
  className?: string;
};

export function SectionHeader({ title, subtitle, href, linkLabel = "View all", id, className }: SectionHeaderProps) {
  return (
    <div id={id} className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div>
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
