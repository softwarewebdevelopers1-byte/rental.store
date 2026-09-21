export interface NavItem {
  label: string;
  to: string;
}

export const publicNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Find a Hostel", to: "/hostels" },
  { label: "Marketplace", to: "/marketplace" },
];

export const studentNav: NavItem[] = [
  { label: "Dashboard", to: "/student/dashboard" },
  { label: "Find Hostel", to: "/hostels" },
  { label: "My Payments", to: "/student/payments" },
  { label: "Messages", to: "/student/messages" },
  { label: "Maintenance", to: "/student/maintenance" },
  { label: "Ratings", to: "/student/ratings" },
  { label: "Change Hostel", to: "/student/change-hostel" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "My Orders", to: "/student/orders" },
];
export const landlordNav: NavItem[] = [
  { label: "Dashboard", to: "/landlord/dashboard" },
  { label: "My Hostels", to: "/landlord/hostels" },
  { label: "Tenants", to: "/landlord/tenants" },
  { label: "Requests", to: "/landlord/requests" },
  { label: "Payments", to: "/landlord/payments" },
  { label: "Messages", to: "/landlord/messages" },
  { label: "Maintenance", to: "/landlord/maintenance" },
  { label: "Caretakers", to: "/landlord/caretakers" },
  { label: "Ratings", to: "/landlord/ratings" },
  { label: "Verification", to: "/landlord/verification" },
];
export const caretakerNav: NavItem[] = [
  { label: "Dashboard", to: "/caretaker/dashboard" },
  { label: "Payments", to: "/caretaker/payments" },
  { label: "Maintenance", to: "/caretaker/maintenance" },
  { label: "Messages", to: "/caretaker/messages" },
  { label: "Tenants", to: "/caretaker/tenants" },
];
export const agentNav: NavItem[] = [
  { label: "Dashboard", to: "/agent/dashboard" },
  { label: "Products", to: "/agent/products" },
  { label: "Packs", to: "/agent/packs" },
  { label: "Orders", to: "/agent/orders" },
  { label: "Conflicts", to: "/agent/conflicts" },
];
export interface AdminNavSection {
  title: string;
  items: NavItem[];
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Landlords", to: "/admin/landlords" },
  { label: "Students", to: "/admin/students" },
  { label: "Caretakers", to: "/admin/caretakers" },
  { label: "Market Agents", to: "/admin/agents" },
  { label: "Hostels", to: "/admin/hostels" },
  { label: "Verifications", to: "/admin/verifications" },
  { label: "Invitations", to: "/admin/invitations" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Conflicts", to: "/admin/conflicts" },
];
