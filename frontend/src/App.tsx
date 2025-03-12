import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import HomePage from "./pages/Home";
import RegisterPage from "./pages/Auth/Register";
import LoginPage from "./pages/Auth/Login";
import CliDownloadPage from "./pages/CliDownload";
import DashboardPage from "./pages/Dashboard";
import TemplatesListPage from "./pages/Templates/TemplatesList";
import TemplateDetailPage from "./pages/Templates/TemplateDetail";
import CreateTemplatePage from "./pages/Templates/CreateTemplate";
import PrivateRoute from "./components/auth/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/download-cli" element={<CliDownloadPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="templates" element={<TemplatesListPage />} />
            <Route path="templates/:id" element={<TemplateDetailPage />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="templates/create" element={<CreateTemplatePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;