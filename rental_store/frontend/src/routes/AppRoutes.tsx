import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { LandlordLayout } from "../layouts/LandlordLayout";
import { CaretakerLayout } from "../layouts/CaretakerLayout";
import { AgentLayout } from "../layouts/AgentLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { RoleRoute } from "./RoleRoute";

import LandingPage from "../pages/public/LandingPage";
import HostelDiscoveryPage from "../pages/public/HostelDiscoveryPage";
import HostelDetailsPage from "../pages/public/HostelDetailsPage";

import MarketplaceHome from "../pages/marketplace/MarketplaceHome";
import ProductsPage from "../pages/marketplace/ProductsPage";
import ProductDetailsPage from "../pages/marketplace/ProductDetailsPage";
import PacksPage from "../pages/marketplace/PacksPage";
import PackDetailsPage from "../pages/marketplace/PackDetailsPage";
import CartPage from "../pages/marketplace/CartPage";
import CheckoutPage from "../pages/marketplace/CheckoutPage";

import LoginPage from "../pages/auth/LoginPage";
import StudentRegisterPage from "../pages/auth/StudentRegisterPage";
import LandlordRegisterPage from "../pages/auth/LandlordRegisterPage";
import MarketAgentRegisterPage from "../pages/auth/MarketAgentRegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import PendingApprovalPage from "../pages/auth/PendingApprovalPage";

import StudentDashboard from "../pages/student/StudentDashboard";
import ChangeHostelPage from "../pages/student/ChangeHostelPage";
import StudentPaymentsPage from "../pages/student/StudentPaymentsPage";
import StudentMessagesPage from "../pages/student/StudentMessagesPage";
import StudentMaintenancePage from "../pages/student/StudentMaintenancePage";
import StudentRatingsPage from "../pages/student/StudentRatingsPage";
import StudentOrdersPage from "../pages/student/StudentOrdersPage";
import StudentOrderDetailsPage from "../pages/student/StudentOrderDetailsPage";

import LandlordDashboard from "../pages/landlord/LandlordDashboard";
import HostelsListPage from "../pages/landlord/HostelsListPage";
import HostelCreatePage from "../pages/landlord/HostelCreatePage";
import LandlordHostelDetailsPage from "../pages/landlord/HostelDetailsPage";
import HostelEditPage from "../pages/landlord/HostelEditPage";
import LandlordTenantsPage from "../pages/landlord/LandlordTenantsPage";
import LandlordRequestsPage from "../pages/landlord/LandlordRequestsPage";
import LandlordPaymentsPage from "../pages/landlord/LandlordPaymentsPage";
import LandlordMessagesPage from "../pages/landlord/LandlordMessagesPage";
import LandlordMaintenancePage from "../pages/landlord/LandlordMaintenancePage";
import LandlordCaretakersPage from "../pages/landlord/LandlordCaretakersPage";
import LandlordRatingsPage from "../pages/landlord/LandlordRatingsPage";
import LandlordVerificationPage from "../pages/landlord/LandlordVerificationPage";

import CaretakerDashboard from "../pages/caretaker/CaretakerDashboard";
import CaretakerMaintenancePage from "../pages/caretaker/CaretakerMaintenancePage";
import CaretakerMessagesPage from "../pages/caretaker/CaretakerMessagesPage";
import CaretakerTenantsPage from "../pages/caretaker/CaretakerTenantsPage";

import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentProductsPage from "../pages/agent/AgentProductsPage";
import AgentProductFormPage from "../pages/agent/AgentProductFormPage";
import AgentPacksPage from "../pages/agent/AgentPacksPage";
import AgentOrdersPage from "../pages/agent/AgentOrdersPage";
import AgentOrderDetailsPage from "../pages/agent/AgentOrderDetailsPage";
import AgentConflictsPage from "../pages/agent/AgentConflictsPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import UserDetailsPage from "../pages/admin/UserDetailsPage";
import LandlordsPage from "../pages/admin/LandlordsPage";
import StudentsPage from "../pages/admin/StudentsPage";
import CaretakersPage from "../pages/admin/CaretakersPage";
import AgentsPage from "../pages/admin/AgentsPage";
import AdminHostelsPage from "../pages/admin/AdminHostelsPage";
import AdminHostelDetailsPage from "../pages/admin/AdminHostelDetailsPage";
import VerificationsPage from "../pages/admin/VerificationsPage";
import InvitationsPage from "../pages/admin/InvitationsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import ConflictsPage from "../pages/admin/ConflictsPage";
import ConflictDetailsPage from "../pages/admin/ConflictDetailsPage";

import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hostels" element={<HostelDiscoveryPage />} />
        <Route path="/hostels/:hostelId" element={<HostelDetailsPage />} />
        <Route path="/marketplace" element={<MarketplaceHome />} />
        <Route path="/marketplace/products" element={<ProductsPage />} />
        <Route path="/marketplace/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/marketplace/packs" element={<PacksPage />} />
        <Route path="/marketplace/packs/:packId" element={<PackDetailsPage />} />
        <Route path="/marketplace/cart" element={<CartPage />} />
        <Route path="/marketplace/checkout" element={<CheckoutPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/register/student" replace />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/landlord" element={<LandlordRegisterPage />} />
        <Route path="/register/market-agent" element={<MarketAgentRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
      </Route>

      <Route element={<RoleRoute allow={["STUDENT"]}><StudentLayout /></RoleRoute>}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/change-hostel" element={<ChangeHostelPage />} />
        <Route path="/student/payments" element={<StudentPaymentsPage />} />
        <Route path="/student/messages" element={<StudentMessagesPage />} />
        <Route path="/student/maintenance" element={<StudentMaintenancePage />} />
        <Route path="/student/ratings" element={<StudentRatingsPage />} />
        <Route path="/student/orders" element={<StudentOrdersPage />} />
        <Route path="/student/orders/:orderId" element={<StudentOrderDetailsPage />} />
      </Route>

      <Route element={<RoleRoute allow={["LANDLORD"]}><LandlordLayout /></RoleRoute>}>
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/landlord/hostels" element={<HostelsListPage />} />
        <Route path="/landlord/hostels/create" element={<HostelCreatePage />} />
        <Route path="/landlord/hostels/:hostelId" element={<LandlordHostelDetailsPage />} />
        <Route path="/landlord/hostels/:hostelId/edit" element={<HostelEditPage />} />
        <Route path="/landlord/tenants" element={<LandlordTenantsPage />} />
        <Route path="/landlord/requests" element={<LandlordRequestsPage />} />
        <Route path="/landlord/payments" element={<LandlordPaymentsPage />} />
        <Route path="/landlord/messages" element={<LandlordMessagesPage />} />
        <Route path="/landlord/maintenance" element={<LandlordMaintenancePage />} />
        <Route path="/landlord/caretakers" element={<LandlordCaretakersPage />} />
        <Route path="/landlord/ratings" element={<LandlordRatingsPage />} />
        <Route path="/landlord/verification" element={<LandlordVerificationPage />} />
      </Route>

      <Route element={<RoleRoute allow={["CARETAKER"]}><CaretakerLayout /></RoleRoute>}>
        <Route path="/caretaker/dashboard" element={<CaretakerDashboard />} />
        <Route path="/caretaker/maintenance" element={<CaretakerMaintenancePage />} />
        <Route path="/caretaker/messages" element={<CaretakerMessagesPage />} />
        <Route path="/caretaker/tenants" element={<CaretakerTenantsPage />} />
      </Route>

      <Route element={<RoleRoute allow={["MARKET_AGENT"]}><AgentLayout /></RoleRoute>}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/products" element={<AgentProductsPage />} />
        <Route path="/agent/products/create" element={<AgentProductFormPage />} />
        <Route path="/agent/products/:productId/edit" element={<AgentProductFormPage />} />
        <Route path="/agent/packs" element={<AgentPacksPage />} />
        <Route path="/agent/orders" element={<AgentOrdersPage />} />
        <Route path="/agent/orders/:orderId" element={<AgentOrderDetailsPage />} />
        <Route path="/agent/conflicts" element={<AgentConflictsPage />} />
      </Route>

      <Route element={<RoleRoute allow={["ADMIN"]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
        <Route path="/admin/landlords" element={<LandlordsPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/caretakers" element={<CaretakersPage />} />
        <Route path="/admin/agents" element={<AgentsPage />} />
        <Route path="/admin/hostels" element={<AdminHostelsPage />} />
        <Route path="/admin/hostels/:hostelId" element={<AdminHostelDetailsPage />} />
        <Route path="/admin/verifications" element={<VerificationsPage />} />
        <Route path="/admin/invitations" element={<InvitationsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/conflicts" element={<ConflictsPage />} />
        <Route path="/admin/conflicts/:conflictId" element={<ConflictDetailsPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
