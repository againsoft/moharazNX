import { AccountDashboard } from "@/components/storefront/account/account-dashboard";

export const metadata = {
  title: "My account — MoharazNX",
  description: "Your MoharazNX dashboard — orders, rewards, wallet, and account settings.",
  robots: { index: false, follow: false },
};

export default function AccountDashboardPage() {
  return <AccountDashboard />;
}
