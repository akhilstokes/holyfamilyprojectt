import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Layouts and Protection
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";

// Buyers pages
import CatalogPage from "./pages/buyers/CatalogPage";
import CartPage from "./pages/buyers/CartPage";
import CheckoutPage from "./pages/buyers/CheckoutPage";
import OrdersPage from "./pages/buyers/OrdersPage";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HistoryPage from "./pages/HistoryPage";
import GalleryPage from "./pages/GalleryPage";
import AdministrationPage from "./pages/AdministrationPage";
import BuyingPage from "./pages/BuyingPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// User Dashboard Pages
import UserHome from "./pages/user_dashboard/UserHome";
import MySubmissions from "./pages/user_dashboard/MySubmissions";
import Profile from "./pages/user_dashboard/Profile";
import SubmitRequest from "./pages/user_dashboard/SubmitRequest";
import LiveRateView from "./pages/user_dashboard/LiveRateView";
import UserRateHistory from "./pages/user_dashboard/UserRateHistory";
import AIDoubtResolver from "./pages/user_dashboard/AIDoubtResolver";
import RubberCalculator from "./pages/user_dashboard/RubberCalculator";
import LatexSelling from "./pages/user_dashboard/LatexSelling";

// Admin Dashboard Pages
import AdminHome from "./pages/admin_dashboard/AdminHome";
import BillRequests from "./pages/admin_dashboard/BillRequests";
import BillManagement from "./pages/admin_dashboard/BillManagement";
import ManageShifts from "./pages/admin_dashboard/ManageShifts";
import LatexManagement from "./pages/admin_dashboard/LatexManagement";
import StockManagement from "./pages/admin_dashboard/StockManagement";
import AdminLeavePage from "./pages/admin_dashboard/AdminLeavePage";
import LiveRatePage from "./pages/admin_dashboard/LiveRatePage"; // ✅ NEW
import ManageRates from "./pages/admin_dashboard/ManageRates";   // ✅ NEW
import BarrelLogistics from "./pages/admin_dashboard/BarrelLogistics";
import UserManagement from "./pages/admin_dashboard/UserManagement";
import EnquiriesPage from "./pages/admin_dashboard/EnquiriesPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/administration" element={<AdministrationPage />} />
        <Route path="/buying" element={<BuyingPage />} />
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

      {/* =================== BUYERS ROUTES =================== */}
      <Route element={<PublicLayout />}>
        <Route path="/buyers/catalog" element={<CatalogPage />} />
        <Route path="/buyers/cart" element={<CartPage />} />
        <Route path="/buyers/checkout" element={<CheckoutPage />} />
        <Route path="/buyers/orders" element={<OrdersPage />} />
      </Route>

      {/* =================== USER DASHBOARD ROUTES =================== */}
     <Route
  path="/user/home"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <UserHome />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/user/submissions"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <MySubmissions />
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
  path="/user/submit-request"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <SubmitRequest />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

{/* ✅ User Live Rate */}
<Route
  path="/user/live-rate"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <LiveRateView />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

{/* ✅ User Rate History */}
<Route
  path="/user/rate-history"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <UserRateHistory />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

{/* ✅ AI Doubt Resolver */}
<Route
  path="/user/ai-doubt-resolver"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <AIDoubtResolver />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

{/* ✅ Rubber Calculator */}
<Route
  path="/user/rubber-calculator"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <RubberCalculator />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

{/* ✅ Latex Selling */}
<Route
  path="/user/latex-selling"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <LatexSelling />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

    
      {/* =================== ADMIN DASHBOARD ROUTES =================== */}
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
      <Route
        path="/admin/bills"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BillRequests />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/bill-management"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BillManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/latex-management"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <LatexManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/shifts"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <ManageShifts />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/stock"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <StockManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/leave"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminLeavePage />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/live-rates" // ✅ Changed to plural for consistency
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <LiveRatePage />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-rates" // ✅ Admin Rate History
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <ManageRates />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/barrel-logistics"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BarrelLogistics />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/user-management"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <UserManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <EnquiriesPage />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
