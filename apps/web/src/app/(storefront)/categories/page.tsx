import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getRootCategories, getChildCategories } from "@/lib/mock-data/categories";
import { categoryPath } from "@/lib/url-slug/storefront-paths";

export default function CategoriesIndexPage() {
  const roots = getRootCategories().filter((c) => c.active);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">All categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse by department or jump into a subcategory.</p>
      </header>

      <div className="space-y-8">
        {roots.map((root) => {
          const children = getChildCategories(root.id);
          return (
            <section key={root.id} className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
              <Link
                href={categoryPath(root.slug)}
                className="group flex items-center gap-4"
              >
                {root.iconUrl && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={root.iconUrl} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold group-hover:text-primary">{root.name}</h2>
                  <p className="text-sm text-muted-foreground">{root.productCount} products</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>

              {children.length > 0 && (
                <ul className="mt-4 grid gap-2 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={categoryPath(child.slug)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-accent"
                      >
                        <span>{child.name}</span>
                        <span className="text-xs text-muted-foreground">{child.productCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
