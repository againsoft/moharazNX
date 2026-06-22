import { Construction } from "lucide-react";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-16 text-center">
      <Construction className="mb-3 h-9 w-9 text-muted-foreground" />
      <h1 className="page-title">{title}</h1>
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground">
        {description ?? "Prototype screen — UI shell navigation works. Full layout coming in Phase 1 batch."}
      </p>
    </div>
  );
}
