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
