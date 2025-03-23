import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import AdminMobileNav from "./AdminMobileNav";
import AdminMobileBottomNav from "./AdminMobileBottomNav";
import AdminFloatingActionButton from "./AdminFloatingActionButton";
import ScrollIndicator from "./ScrollIndicator";
import ScrollToTopButton from "./ScrollToTopButton";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-right" dir="rtl">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header isAdmin={true} />
        <AdminMobileNav />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4 bg-gray-50/80 section">
          <Outlet />
        </main>
        <AdminFloatingActionButton />
        <AdminMobileBottomNav />
        <ScrollIndicator
          routes={[
            "/admin",
            "/admin/customers",
            "/admin/accounts",
            "/admin/transactions",
            "/admin/currencies",
            "/admin/alerts",
            "/admin/security",
            "/admin/settings",
          ]}
          basePath="/admin"
        />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
