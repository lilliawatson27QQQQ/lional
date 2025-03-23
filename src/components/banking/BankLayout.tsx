import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import MobileBottomNav from "./MobileBottomNav";
import FloatingActionButton from "./FloatingActionButton";
import NavigationMenu from "./NavigationMenu";
import ScrollIndicator from "./ScrollIndicator";
import ScrollToTopButton from "./ScrollToTopButton";

export default function BankLayout() {
  return (
    <div className="flex h-screen bg-blue-50 text-right" dir="rtl">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <MobileNav />
        <main className="flex-1 p-4 pb-20 md:pb-4 bg-blue-50 overflow-hidden section">
          <Outlet />
        </main>
        <FloatingActionButton />
        <NavigationMenu />
        <ScrollIndicator
          routes={[
            "/bank",
            "/bank/accounts",
            "/bank/currencies",
            "/bank/transfers",
            "/bank/transactions",
            "/bank/savings",
            "/bank/visa",
            "/bank/settings",
            "/bank/help",
            "/bank/deposit-instructions",
          ]}
          basePath="/bank"
        />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
