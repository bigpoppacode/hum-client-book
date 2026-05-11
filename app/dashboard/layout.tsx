import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell mx-auto min-h-screen max-w-2xl overflow-hidden">
      <Toast />
      <main className="pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
