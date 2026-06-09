import React from "react";
import { Toaster } from "./components/ui/toaster.jsx";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";

import FuelPricesPage from "./pages/FuelPricesPage";
import ProductsPage from "./pages/ProductsPage"; // New Import
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import DailyEntriesPage from "./pages/DailyEntriesPage";
import SettlementsPage from "./pages/SettlementsPage";
import PumpsPage from "./pages/PumpsPage";
import TanksPage from "./pages/TanksPage"; // New Import

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />

              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pumps" element={<PumpsPage />} />
                <Route path="/daily-entries" element={<DailyEntriesPage />} />
                <Route path="/prices" element={<FuelPricesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/settlements" element={<SettlementsPage />} />
                <Route path="/tanks" element={<TanksPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
