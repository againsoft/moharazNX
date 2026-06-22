/** Minimal layout for print documents — no admin sidebar/header. */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="print-app-root min-h-screen bg-[#ececec]">{children}</div>;
}
