import { PlaceholderPage } from "@/components/placeholder-page";

export default function NotificationsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <nav aria-label="Breadcrumb" className="mb-1">
        <ol className="page-subtitle flex flex-wrap items-center gap-1">
          <li>MoharazNX</li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Notifications</li>
        </ol>
      </nav>
      <h1 className="page-title">Notifications</h1>
      <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
        Order alerts, stock warnings, and store activity notifications.
      </p>
      <div className="mt-4">
        <PlaceholderPage
          title="Notification center"
          description="Full notification list and preferences will mount here."
        />
      </div>
    </div>
  );
}
