import { AccountShell } from "@/components/storefront/account/account-shell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
