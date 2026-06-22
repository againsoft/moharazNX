import { AdminAuthGate } from "@/components/auth/admin-auth-gate";
import { AdminShell } from "@/components/layout/admin-shell";
import { AgGridSetup } from "@/components/providers/ag-grid-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <AgGridSetup>
        <AdminShell>{children}</AdminShell>
      </AgGridSetup>
    </AdminAuthGate>
  );
}
