import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AdminLayout } from "./AdminLayout";
import { AgentLayout } from "./AgentLayout";
import { CaretakerLayout } from "./CaretakerLayout";
import { LandlordLayout } from "./LandlordLayout";
import { StudentLayout } from "./StudentLayout";

export function AccountSettingsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "STUDENT":
      return <StudentLayout />;
    case "LANDLORD":
      return <LandlordLayout />;
    case "CARETAKER":
      return <CaretakerLayout />;
    case "MARKET_AGENT":
      return <AgentLayout />;
    case "ADMIN":
      return <AdminLayout />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
