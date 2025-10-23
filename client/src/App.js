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
import ManagerHome from "./pages/manager/ManagerHome";
import ManagerLiveLocations from "./pages/manager/DeliveryLiveMap";
import LiveCheckins from "./pages/manager/LiveCheckins";
import PendingLeaves from "./pages/manager/PendingLeaves";
import ManagerAttendance from "./pages/manager/ManagerAttendance";
import ManagerHangerSpace from "./pages/manager/ManagerHangerSpace";
import ManagerShifts from "./pages/manager/ManagerShifts";
import ManagerLatexBilling from "./pages/manager/ManagerLatexBilling";
import ManagerRateUpdate from "./pages/manager/ManagerRateUpdate";
import ManagerWages from "./pages/manager/ManagerWages";
import ManagerStock from "./pages/manager/ManagerStock";
import ManagerChemicalHistory from "./pages/manager/ManagerChemicalHistory";
import ManagerSellRequests from "./pages/manager/ManagerSellRequests";
import ManagerChemicalRequests from "./pages/manager/ManagerChemicalRequests";
import ManagerFaultyBarrels from "./pages/manager/ManagerFaultyBarrels";
import ManagerCompleted from "./pages/manager/ManagerCompleted";
import ManagerRepairApprovals from "./pages/manager/ManagerRepairApprovals";
import ManagerLeaveHistory from "./pages/manager/ManagerLeaveHistory";
import LabProtectedRoute from "./components/common/LabProtectedRoute";
import LabDashboard from "./pages/lab/LabDashboard";
import LabDashboardLayout from "./layouts/LabDashboardLayout";
import LabCheckIn from "./pages/lab/LabCheckIn";
import LabDRCUpdate from "./pages/lab/LabDRCUpdate";
import LabQueue from "./pages/lab/LabQueue";
import LabReports from "./pages/lab/LabReports";
import LabAttendance from "./pages/lab/LabAttendance";
import LabLeave from "./pages/lab/LabLeave";
import LabShiftSchedule from "./pages/lab/LabShiftSchedule";
import LabSalary from "./pages/lab/LabSalary";
import LabSellTests from "./pages/lab/LabSellTests";
import LabChemicalRequests from "./pages/lab/LabChemicalRequests";
import LabBarrelWeights from "./pages/lab/LabBarrelWeights";
import LabRepairJobs from "./pages/lab/LabRepairJobs";

// Accountant Module
import AccountantProtectedRoute from "./components/common/AccountantProtectedRoute";
import AccountantDashboardLayout from "./layouts/AccountantDashboardLayout";
import AccountantLatexVerify from "./pages/accountant/AccountantLatexVerify";
import AccountantWages from "./pages/accountant/AccountantWages";
import AccountantStockMonitor from "./pages/accountant/AccountantStockMonitor";
import AccountantAttendance from "./pages/accountant/AccountantAttendance";
import AccountantLeave from "./pages/accountant/AccountantLeave";
import AccountantBillPayments from "./pages/accountant/AccountantBillPayments";
import AccountantSalaries from "./pages/accountant/AccountantSalaries";

// Buyers module removed

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HistoryPage from "./pages/HistoryPage";
import GalleryPage from "./pages/GalleryPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import StaffLoginPage from "./pages/auth/StaffLoginPage";

// User Dashboard Pages (restricted sidebar to Profile and Live Rate)
import Profile from "./pages/user_dashboard/Profile";
import ProfileView from "./pages/user_dashboard/ProfileView";
import UserLiveRate from "./pages/UserLiveRate";
import Notifications from "./pages/user_dashboard/Notifications";
import UserDashboard from "./pages/user_dashboard/UserDashboard";
import UserTransactions from "./pages/user_dashboard/UserTransactions";
import UserTransactionDetail from "./pages/user_dashboard/UserTransactionDetail";
import UserRequests from "./pages/user_dashboard/UserRequests";
import UserSellRequests from "./pages/user_dashboard/UserSellRequests";
 
import StaffProtectedRoute from "./components/common/StaffProtectedRoute";
import StaffDashboardLayout from "./layouts/StaffDashboardLayout";
import StaffDashboard from "./pages/user_dashboard/StaffDashboard";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffAttendance from "./pages/staff/StaffAttendance";
import StaffSalary from "./pages/staff/StaffSalary";
import StaffLeave from "./pages/staff/StaffLeave";
import StaffShiftSchedule from "./pages/staff/StaffShiftSchedule";
import MySchedule from "./pages/staff/MySchedule";
import StaffWageRates from "./pages/staff/StaffWageRates";
import StaffIssues from "./pages/staff/StaffIssues";
import StaffHangerSpace from "./pages/staff/StaffHangerSpace";
// New staff route planning pages
import StaffRoutePlan from "./pages/staff/StaffRoutePlan";
import StaffPickups from "./pages/staff/StaffPickups";
// Delivery Staff
import DeliveryProtectedRoute from "./components/common/DeliveryProtectedRoute";

// Workflow Components
import FieldStaffDashboard from "./components/dashboards/FieldStaffDashboard";
import LabStaffDashboard from "./components/dashboards/LabStaffDashboard";
import ManagerVerificationDashboard from "./components/workflows/ManagerVerification";
import CustomerBillingDashboard from "./components/workflows/CustomerBilling";
import DeliveryDashboardLayout from "./layouts/DeliveryDashboardLayout";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryRoutePlan from "./pages/delivery/DeliveryRoutePlan";
import DeliveryLiveLocation from "./pages/delivery/DeliveryLiveLocation";
import DeliveryTasks from "./pages/delivery/DeliveryTasks";
import DeliveryTaskHistory from "./pages/delivery/DeliveryTaskHistory";
import DeliveryBarrelIntake from "./pages/delivery/DeliveryBarrelIntake";
import DeliveryBarrelMovement from "./pages/delivery/DeliveryBarrelMovement";
import AccountantBarrelVerify from "./pages/accountant/AccountantBarrelVerify";
import DeliveryAttendance from "./pages/delivery/DeliveryAttendance";
import DeliveryLeave from "./pages/delivery/DeliveryLeave";
import DeliverySalary from "./pages/delivery/DeliverySalary";
// Admin Pages
import AdminHome from "./pages/admin/AdminHome";
import Attendance from "./pages/admin/Attendance";
import GodownRubberStock from "./pages/admin/GodownRubberStock";
import HangerSpace from "./pages/admin/HangerSpace";
import YardStock from "./pages/admin/YardStock";
import ChemicalStockHistory from "./pages/admin/ChemicalStockHistory";
import WorkerSchedule from "./pages/admin/WorkerSchedule";
import AdminStaff from "./pages/admin/AdminStaff";
import StaffVerify from "./pages/auth/StaffVerify";
import AdminRateVerification from "./pages/admin/AdminRateVerification";
import AdminDeliveryTasks from "./pages/admin/AdminDeliveryTasks";
import StaffRecordManagement from "./pages/admin/StaffRecordManagement";
import AdminChemicalRequests from "./pages/admin/AdminChemicalRequests";
import WorkerDocuments from "./pages/admin/WorkerDocuments";
import BarrelAssignments from "./pages/admin/BarrelAssignments";
import AdminBarrelWorkflow from "./pages/admin/AdminBarrelWorkflow";
import AdminCreateBarrel from "./pages/admin/AdminCreateBarrel";
import BarrelHistory from "./pages/common/BarrelHistory";
// Field tools & extras
import BarrelQRScanner from "./pages/field/BarrelQRScanner";
import LabourSalaryDetails from "./pages/staff/LabourSalaryDetails";

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

      {/* Additional Staff Tools */}
      <Route
  path="/staff/labour-salary-details"
  element={
    <StaffProtectedRoute>
      <StaffDashboardLayout>
        <LabourSalaryDetails />
      </StaffDashboardLayout>
    </StaffProtectedRoute>
  }
/>
    
      {/* =================== LAB ROUTES =================== */}
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
      <Route
        path="/lab/attendance"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabAttendance />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/leave"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabLeave />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/shift-schedule"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabShiftSchedule />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/check-in"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabCheckIn />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/drc-update"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabDRCUpdate />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/queue"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabQueue />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/barrel-weights"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabBarrelWeights />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/repair-jobs"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabRepairJobs />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/chem-requests"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabChemicalRequests />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/reports"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabReports />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/sell-tests"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabSellTests />
            </LabDashboardLayout>
          </LabProtectedRoute>
        }
      />
      <Route
        path="/lab/salary"
        element={
          <LabProtectedRoute>
            <LabDashboardLayout>
              <LabSalary />
            </LabDashboardLayout>
          </LabProtectedRoute>
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
      <Route
        path="/staff/verify/:token"
        element={<StaffVerify />}
      />
      {/* Redirect old staff/register URLs to staff/verify */}
      <Route
        path="/staff/register/:token"
        element={
          <GuestRoute>
            <StaffVerify />
          </GuestRoute>
        }
      />

      {/* Buyers module removed */}

      {/* =================== USER DASHBOARD ROUTES =================== */}

      {/* Keep only Profile and Live Rate */}
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
        path="/user/live-rate"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserLiveRate />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/transactions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserTransactions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/transactions/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserTransactionDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/requests"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/sell-requests"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserSellRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Optional user tools (not in sidebar) */}
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

    
      {/* =================== DELIVERY STAFF ROUTES =================== */}
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
      <Route
        path="/delivery/route-plan"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryRoutePlan />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/live-location"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryLiveLocation />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/tasks"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryTasks />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/task-history"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryTaskHistory />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/barrel-scan"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <BarrelQRScanner />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/barrel-intake"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryBarrelIntake />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/barrel-movement"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryBarrelMovement />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/attendance"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryAttendance />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/leave"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliveryLeave />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
      <Route
        path="/delivery/salary"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboardLayout>
              <DeliverySalary />
            </DeliveryDashboardLayout>
          </DeliveryProtectedRoute>
        }
      />
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
      <Route
        path="/staff/operations"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffDashboard />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/hanger-spaces"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffHangerSpace />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      {/* Documents (upload) */}
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
      {/* Alias for documents */}
      <Route
        path="/staff/documents"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              {React.createElement(require('./pages/staff/StaffDocumentUpload').default)}
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
        path="/staff/wage-rates"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffWageRates />
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
      {/* My Schedule with change request functionality */}
      <Route
        path="/staff/schedule"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <MySchedule />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/issues"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffIssues />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/barrel-history"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <BarrelHistory />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/barrel-scan"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <BarrelQRScanner />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />

      {/* New staff route planning & pickups */}
      <Route
        path="/staff/route-plan"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffRoutePlan />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/pickups"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <StaffPickups />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      
      {/* Field Staff Workflow Routes */}
      <Route
        path="/field-staff/dashboard"
        element={
          <StaffProtectedRoute>
            <StaffDashboardLayout>
              <FieldStaffDashboard />
            </StaffDashboardLayout>
          </StaffProtectedRoute>
        }
      />
      
      {/* Lab Staff Workflow Routes */}
      <Route
        path="/lab/dashboard"
        element={
          <LabProtectedRoute>
            <StaffDashboardLayout>
              <LabStaffDashboard />
            </StaffDashboardLayout>
          </LabProtectedRoute>
        }
      />
      
      {/* Manager Verification Routes */}
      <Route
        path="/manager/verification"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerVerificationDashboard />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      
      {/* Customer Billing Routes */}
      <Route
        path="/user/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CustomerBillingDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

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
      <Route
        path="/manager/home"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerHome />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/live"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <LiveCheckins />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/live-locations"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerLiveLocations />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/leaves"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <PendingLeaves />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/leave-history"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerLeaveHistory />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/attendance"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerAttendance />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/hanger-space"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerHangerSpace />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/shifts"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerShifts />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/sell-requests"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerSellRequests />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/faulty-barrels"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerFaultyBarrels />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/repair-approvals"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerRepairApprovals />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/completed"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerCompleted />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/latex-billing"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerLatexBilling />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/barrel-intakes"
        element={<Navigate to="/manager/sell-requests" replace />}
      />
      <Route
        path="/manager/rates"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerRateUpdate />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/wages"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerWages />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/stock"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerStock />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/chem-requests"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerChemicalRequests />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/chemicals"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <ManagerChemicalHistory />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/barrel-scan"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <BarrelQRScanner />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />
      <Route
        path="/manager/barrel-history"
        element={
          <ManagerProtectedRoute>
            <ManagerDashboardLayout>
              <BarrelHistory />
            </ManagerDashboardLayout>
          </ManagerProtectedRoute>
        }
      />

      {/* =================== ADMIN ROUTES =================== */}
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
        path="/admin/create-barrel"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminCreateBarrel />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/rates"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminRateVerification />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/delivery"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminDeliveryTasks />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <Attendance />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/yard-stock"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <YardStock />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/godown-rubber-stock"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <GodownRubberStock />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminStaff />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/staff-records"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <StaffRecordManagement />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/hanger-space"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <HangerSpace />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/chemical-stock-history"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <ChemicalStockHistory />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/worker-schedule"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <WorkerSchedule />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/worker-documents"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <WorkerDocuments />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/barrels-workflow"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminBarrelWorkflow />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/barrel-history"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BarrelHistory />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/chem-requests"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <AdminChemicalRequests />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />

      {/* =================== ACCOUNTANT ROUTES =================== */}
      <Route
        path="/accountant/latex"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantLatexVerify />
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
      <Route
        path="/accountant/stock"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantStockMonitor />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/accountant/attendance"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantAttendance />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/accountant/leave"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantLeave />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/accountant/payments"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantBillPayments />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/accountant/salaries"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantSalaries />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/accountant/barrels"
        element={
          <AccountantProtectedRoute>
            <AccountantDashboardLayout>
              <AccountantBarrelVerify />
            </AccountantDashboardLayout>
          </AccountantProtectedRoute>
        }
      />
      <Route
        path="/admin/barrel-assignments"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout>
              <BarrelAssignments />
            </AdminDashboardLayout>
          </AdminProtectedRoute>
        }
      />
    </Routes>
    </RoleThemeProvider>
  );
}

export default App;
