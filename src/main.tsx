import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "@/modules/auth/context";
import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppLayout, AppContent } from "@/components/layout/app-layout";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import MenuPage from "@/pages/menu";
import MenuAddPage from "@/pages/menu-add";
import MenuCategoriesPage from "@/pages/menu-categories";
import TablesPage from "@/pages/tables";
import OrdersPage from "@/pages/orders";
import StaffPage from "@/pages/staff";
import ReportsPage from "@/pages/reports";
import SettingPage from "@/pages/setting";

import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/auth/signin" element={<AuthPage />} />
              <Route path="/auth/signup" element={<AuthPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<AppContent />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/add" element={<MenuAddPage />} />
                <Route
                  path="/menu/categories"
                  element={<MenuCategoriesPage />}
                />
                <Route path="/tables" element={<TablesPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/setting/*" element={<SettingPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
