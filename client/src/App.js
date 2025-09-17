import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Layouts and Protection
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import BuyersDashboardLayout from "./layouts/BuyersDashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";

// Buyers pages
import CatalogPage from "./pages/buyers/CatalogPage";
import CartPage from "./pages/buyers/CartPage";
import CheckoutPage from "./pages/buyers/CheckoutPage";
import OrdersPage from "./pages/buyers/OrdersPage";
import ProductDetailsPage from "./pages/buyers/ProductDetailsPage";
import ThankYouPage from "./pages/buyers/ThankYouPage";
import BuyersProfile from "./pages/buyers/BuyersProfile";
import QuickCheckout from "./pages/buyers/QuickCheckout";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HistoryPage from "./pages/HistoryPage";
import GalleryPage from "./pages/GalleryPage";
import AdministrationPage from "./pages/AdministrationPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import StaffLoginPage from "./pages/auth/StaffLoginPage";
import StaffRegisterPage from "./pages/auth/StaffRegisterPage";

// User Dashboard Pages
import UserHome from "./pages/user_dashboard/UserHome";
import MySubmissions from "./pages/user_dashboard/MySubmissions";
import Profile from "./pages/user_dashboard/Profile";
import ProfileView from "./pages/user_dashboard/ProfileView";
import Notifications from "./pages/user_dashboard/Notifications";
import ScrapeEntryPage from "./pages/user_dashboard/ScrapeEntryPage";
import SalesPage from "./pages/user_dashboard/SalesPage";
import WorkHistoryPage from "./pages/user_dashboard/WorkHistoryPage";
import InventoryPage from "./pages/user_dashboard/InventoryPage";
import SubmitRequest from "./pages/user_dashboard/SubmitRequest";
import LiveRateView from "./pages/user_dashboard/LiveRateView";
import UserRateHistory from "./pages/user_dashboard/UserRateHistory";
import AIDoubtResolver from "./pages/user_dashboard/AIDoubtResolver";
import RubberCalculator from "./pages/user_dashboard/RubberCalculator";
import LatexSelling from "./pages/user_dashboard/LatexSelling";
import MenuPage from "./pages/user_dashboard/MenuPage";

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
import StaffOperationsDashboard from "./pages/admin_dashboard/StaffOperationsDashboard";
import AdminBuyerProfiles from "./pages/admin_dashboard/AdminBuyerProfiles";
import StaffProtectedRoute from "./components/common/StaffProtectedRoute";
import StaffDashboardLayout from "./layouts/StaffDashboardLayout";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffWeighLatex from "./pages/staff/StaffWeighLatex";
import StaffDispatchBarrels from "./pages/staff/StaffDispatchBarrels";
import StaffReturnBarrels from "./pages/staff/StaffReturnBarrels";
import WorkerReport from "./pages/admin_dashboard/WorkerReport";
import StaffOperationsLanding from "./pages/staff/StaffOperationsLanding";
import AddBarrelPage from "./pages/staff/AddBarrelPage";
import LogTripKmPage from "./pages/staff/LogTripKmPage";
import StaffAttendance from "./pages/staff/StaffAttendance";
import StaffSalary from "./pages/staff/StaffSalary";
import StaffLeave from "./pages/staff/StaffLeave";
import StaffShiftSchedule from "./pages/staff/StaffShiftSchedule";
import StaffInventory from "./pages/staff/StaffInventory";
import DispatchBarrels from "./pages/admin_dashboard/DispatchBarrels";
import ReturnBarrels from "./pages/admin_dashboard/ReturnBarrels";
import WeighLatex from "./pages/admin_dashboard/WeighLatex";
import PriceLatex from "./pages/admin_dashboard/PriceLatex";
import BarrelDistribution from "./pages/admin_dashboard/BarrelDistribution";
import RequestsIssues from "./pages/admin_dashboard/RequestsIssues";
import AdminSalaryManagement from "./pages/admin_dashboard/AdminSalaryManagement";
import AdminAttendanceReport from "./pages/admin_dashboard/AdminAttendanceReport";
import AdminRateHistory from "./pages/admin_dashboard/AdminRateHistory";

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
        path="/staff/register"
        element={
          <GuestRoute>
            <StaffRegisterPage />
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
        <Route path="/buyers/product/:id" element={<ProductDetailsPage />} />
      </Route>

      {/* Buyers Dashboard Routes (separate from user dashboard) */}
      <Route element={<BuyersDashboardLayout />}>
        <Route path="/buyers/dashboard" element={<CatalogPage />} />
        <Route path="/buyers/quick-checkout" element={<QuickCheckout />} />
        <Route path="/buyers/profile" element={<BuyersProfile />} />
        <Route path="/buyers/cart" element={<CartPage />} />
        <Route path="/buyers/checkout" element={<CheckoutPage />} />
        <Route path="/buyers/orders" element={<OrdersPage />} />
        <Route path="/buyers/thank-you" element={<ThankYouPage />} />
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
  path="/user/menu"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <MenuPage />
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
  path="/user/profile/view"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileView />
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

<Route
  path="/user/scrape-entry"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <ScrapeEntryPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/user/sales"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <SalesPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/user/work-history"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <WorkHistoryPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/user/inventory"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <InventoryPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/user/notifications"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <Notifications />
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
        path="/admin/dispatch"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <DispatchBarrels />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/return"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <ReturnBarrels />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/weigh"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <WeighLatex />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/price"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <PriceLatex />
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
        path="/admin/rate-history"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminRateHistory />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/live-rates"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <LiveRatePage />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-rates"
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
        path="/admin/barrel-distribution"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BarrelDistribution />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/requests-issues"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <RequestsIssues />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/staff-operations"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <StaffOperationsDashboard />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance-report"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminAttendanceReport />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/salary"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminSalaryManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/worker-report"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <WorkerReport />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      {/* =================== STAFF ROUTES =================== */}
      <Route
        path="/staff/operations"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffOperationsLanding />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/inventory"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffInventory />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/operations/upload-document"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              {React.createElement(require('./pages/staff/StaffDocumentUpload').default)}
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/operations/add-barrel"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <AddBarrelPage />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/operations/trip-km"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <LogTripKmPage />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffProfile />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/attendance"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffAttendance />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/salary"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffSalary />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/salary/daily"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffSalary defaultView="daily" />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/salary/monthly"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffSalary defaultView="staff" />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/leave"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffLeave />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/shift-schedule"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffShiftSchedule />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/weigh-latex"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffWeighLatex />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/dispatch-barrels"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffDispatchBarrels />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/return-barrels"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffReturnBarrels />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
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
        path="/admin/buyer-profiles"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminBuyerProfiles />
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
