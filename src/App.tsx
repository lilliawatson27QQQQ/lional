import { Suspense, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./components/home";
import Login from "./components/banking/Login";
import Register from "./components/banking/Register";
import BankLayout from "./components/banking/BankLayout";
import AdminLayout from "./components/banking/AdminLayout";
import Dashboard from "./components/banking/Dashboard";
import AdminDashboard from "./components/banking/AdminDashboard";
import Accounts from "./components/banking/Accounts";
import Transfers from "./components/banking/Transfers";
import Transactions from "./components/banking/Transactions";
import Savings from "./components/banking/Savings";
import CurrencyAccounts from "./components/banking/CurrencyAccounts";
import VisaCard from "./components/banking/VisaCard";
import Settings from "./components/banking/Settings";
import CustomerManagement from "./components/banking/CustomerManagement";
import BankCurrencySettings from "./components/banking/BankCurrencySettings";
import BankAccounts from "./components/banking/BankAccounts";
import CustomerDepositInstructions from "./components/banking/CustomerDepositInstructions";
import ConnectionTest from "./components/banking/ConnectionTest";
import VerifyIdentity from "./components/banking/VerifyIdentity";
import VerificationSuccess from "./components/banking/VerificationSuccess";
import { DebugPanel } from "./components/ui/debug-panel";
import routes from "tempo-routes";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle one-page scroll effect for bank and admin layouts
  useEffect(() => {
    // Only apply scroll effect on bank and admin routes
    if (
      location.pathname.startsWith("/bank") ||
      location.pathname.startsWith("/admin")
    ) {
      let isScrolling = false;
      let lastScrollTime = 0;
      const scrollCooldown = 1000; // 1 second cooldown between scroll actions

      // Define the routes for each layout
      const bankRoutes = [
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
      ];

      const adminRoutes = [
        "/admin",
        "/admin/customers",
        "/admin/accounts",
        "/admin/transactions",
        "/admin/currencies",
        "/admin/alerts",
        "/admin/security",
        "/admin/settings",
      ];

      // Determine which route array to use based on current path
      const routes = location.pathname.startsWith("/bank")
        ? bankRoutes
        : adminRoutes;
      const currentIndex = routes.indexOf(location.pathname);

      const handleWheel = (e: WheelEvent) => {
        const now = Date.now();
        if (isScrolling || now - lastScrollTime < scrollCooldown) return;

        isScrolling = true;
        lastScrollTime = now;

        if (e.deltaY > 0 && currentIndex < routes.length - 1) {
          // Scroll down - go to next section
          navigate(routes[currentIndex + 1]);
        } else if (e.deltaY < 0 && currentIndex > 0) {
          // Scroll up - go to previous section
          navigate(routes[currentIndex - 1]);
        }

        setTimeout(() => {
          isScrolling = false;
        }, scrollCooldown);
      };

      window.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        window.removeEventListener("wheel", handleWheel);
      };
    }
  }, [location.pathname, navigate]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-identity" element={<VerifyIdentity />} />
          <Route
            path="/verification-success"
            element={<VerificationSuccess />}
          />
          <Route path="/connection-test" element={<ConnectionTest />} />

          {/* مسارات العميل */}
          <Route path="/bank" element={<BankLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="currencies" element={<CurrencyAccounts />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="savings" element={<Savings />} />
            <Route path="visa" element={<VisaCard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Dashboard />} />
            <Route
              path="deposit-instructions"
              element={<CustomerDepositInstructions />}
            />
          </Route>

          {/* مسارات المدير */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="accounts" element={<BankAccounts />} />
            <Route path="transactions" element={<AdminDashboard />} />
            <Route path="currencies" element={<BankCurrencySettings />} />
            <Route path="alerts" element={<AdminDashboard />} />
            <Route path="security" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>

          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <DebugPanel />
      </>
    </Suspense>
  );
}

export default App;
