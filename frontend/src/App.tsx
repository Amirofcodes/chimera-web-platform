// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import context providers to manage authentication and theme state across the app.
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Import the main layout component which wraps pages that share common UI elements (e.g., header, footer).
import { MainLayout } from "./components/layout/MainLayout";

// Import individual pages for routing.
import HomePage from "./pages/Home";
import RegisterPage from "./pages/Auth/Register";
import LoginPage from "./pages/Auth/Login";
import ForgotPasswordPage from "./pages/Auth/ForgotPassword";
import ResetPasswordPage from "./pages/Auth/ResetPassword";
import CliDownloadPage from "./pages/CliDownload";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/Profile";
import TemplatesListPage from "./pages/Templates/TemplatesList";
import TemplateDetailPage from "./pages/Templates/TemplateDetail";
import SupportPage from "./pages/Support";

// Import route wrappers to protect routes based on authentication status.
import PrivateRoute from "./components/auth/PrivateRoute"; // Only accessible when logged in.
import PublicRoute from "./components/auth/PublicRoute";   // Redirects to dashboard if already logged in.

const App = () => {
  return (
    // BrowserRouter manages the routing for the application.
    <BrowserRouter>
      {/* ThemeProvider supplies theming (light/dark, etc.) across the app */}
      <ThemeProvider>
        {/* AuthProvider supplies authentication context, such as current user info and token */}
        <AuthProvider>
          {/* Define all routes for the application */}
          <Routes>
            {/* Public routes for authentication-related pages.
                PublicRoute ensures that if the user is already authenticated,
                they are redirected to a protected route (e.g., dashboard). */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>
            
            {/* Routes wrapped in MainLayout that share common layout elements (header, footer, etc.) */}
            <Route path="/" element={<MainLayout />}>
              {/* Default home page */}
              <Route index element={<HomePage />} />
              {/* Public page for CLI download */}
              <Route path="download-cli" element={<CliDownloadPage />} />
              
              {/* Protected routes that require authentication.
                  PrivateRoute ensures these routes are accessible only to logged-in users. */}
              <Route element={<PrivateRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="templates" element={<TemplatesListPage />} />
                <Route path="templates/:id" element={<TemplateDetailPage />} />
                <Route path="support" element={<SupportPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
