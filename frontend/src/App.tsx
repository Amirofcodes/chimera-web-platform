// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
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
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes - redirect to dashboard if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="download-cli" element={<CliDownloadPage />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="templates" element={<TemplatesListPage />} />
              <Route path="templates/:id" element={<TemplateDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;