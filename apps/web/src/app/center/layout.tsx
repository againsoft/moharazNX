import { AdminThemeShell } from "@/components/providers/admin-theme-shell";
import { CenterShell } from "@/components/center/center-shell";

export default function CenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeShell>
      <CenterShell>{children}</CenterShell>
    </AdminThemeShell>
  );
}
