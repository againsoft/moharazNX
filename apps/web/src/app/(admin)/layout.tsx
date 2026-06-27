import { AdminAuthGate } from "@/components/auth/admin-auth-gate";
import { AdminShell } from "@/components/layout/admin-shell";
import { AgGridSetup } from "@/components/providers/ag-grid-provider";
import { AdminThemeShell } from "@/components/providers/admin-theme-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeShell>
      <AdminAuthGate>
        <AgGridSetup>
          <AdminShell>{children}</AdminShell>
        </AgGridSetup>
      </AdminAuthGate>
    </AdminThemeShell>
  );
}
