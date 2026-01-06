import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./styles/theme.css";
import "./styles/roleBasedTheme.css";
import "./styles/barrelWorkflow.css";
import { RoleThemeProvider } from "./components/common/RoleThemeProvider";

// Layouts and Protection
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import ManagerProtectedRoute from "./components/common/ManagerProtectedRoute";
import ManagerDashboardLayout from "./layouts/ManagerDashboardLayout";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerHome from "./pages/manager/ManagerHome";

// Lab Pages
import LabProtectedRoute from "./components/common/LabProtectedRoute";
import LabDashboard from "./pages/lab/LabDashboard";
import LabDashboardLayout from "./layouts/LabDashboardLayout";

// Accountant Module
import AccountantProtectedRoute from "./components/common/AccountantProtectedRoute";
import AccountantDashboardLayout from "./layouts/AccountantLayoutAntigravity";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AccountantWages from "./pages/accountant/AccountantWages";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HistoryPage from "./pages/HistoryPage";
import GalleryPage from "./pages/GalleryPage";
import AwardsPage from "./pages/AwardsPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import StaffLoginPage from "./pages/auth/StaffLoginPage";

// User Dashboard Pages
import Profile from "./pages/user_dashboard/Profile";
import UserLiveRate from "./pages/UserLiveRate";
import UserDashboard from "./pages/user_dashboard/UserDashboard";

// Staff Pages
import StaffProtectedRoute from "./components/common/StaffProtectedRoute";
import StaffDashboardLayout from "./layouts/StaffDashboardLayout";
import StaffDashboard from "./pages/user_dashboard/StaffDashboard";

// Delivery Staff
import DeliveryProtectedRoute from "./components/common/DeliveryProtectedRoute";
import DeliveryDashboardLayout from "./layouts/DeliveryDashboardLayout";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

// Admin Pages
import AdminHome from "./pages/admin/AdminHome";

function App() {
  return (
    <RoleThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/staff/login"
          element={
            <GuestRoute>
              <StaffLoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />

        {/* User Dashboard Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/live-rate"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserLiveRate />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <StaffProtectedRoute>
              <StaffDashboardLayout>
                <StaffDashboard />
              </StaffDashboardLayout>
            </StaffProtectedRoute>
          }
        />

        {/* Lab Routes */}
        <Route
          path="/lab/dashboard"
          element={
            <LabProtectedRoute>
              <LabDashboardLayout>
                <LabDashboard />
              </LabDashboardLayout>
            </LabProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ManagerProtectedRoute>
              <ManagerDashboardLayout>
                <ManagerHome />
              </ManagerDashboardLayout>
            </ManagerProtectedRoute>
          }
        />

        {/* Delivery Routes */}
        <Route
          path="/delivery"
          element={
            <DeliveryProtectedRoute>
              <DeliveryDashboardLayout>
                <DeliveryDashboard />
              </DeliveryDashboardLayout>
            </DeliveryProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/home"
          element={
            <AdminProtectedRoute>
              <AdminDashboardLayout>
                <AdminHome />
              </AdminDashboardLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Accountant Routes */}
        <Route
          path="/accountant"
          element={
            <AccountantProtectedRoute>
              <AccountantDashboardLayout>
                <AccountantDashboard />
              </AccountantDashboardLayout>
            </AccountantProtectedRoute>
          }
        />
        <Route
          path="/accountant/wages"
          element={
            <AccountantProtectedRoute>
              <AccountantDashboardLayout>
                <AccountantWages />
              </AccountantDashboardLayout>
            </AccountantProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RoleThemeProvider>
  );
}

export default App;