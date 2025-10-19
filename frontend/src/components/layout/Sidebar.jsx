import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Heart,
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  Calendar,
  CreditCard,
  Pill,
  FileText,
  Settings,
  Stethoscope,
  ArrowRightLeft,
  BarChart3,
  Shield,
  HelpCircle,
  Activity,
  UserCheck,
  X,
} from "lucide-react";

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = (role) => {
    const baseItems = [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
    ];

    switch (role) {
      case "super_master_admin":
        return [
          ...baseItems,
          { path: "/clinics", label: "Clinic Management", icon: Building2 },
          { path: "/patients", label: "Patient List", icon: UserPlus },
          { path: "/appointments", label: "Appointments", icon: Calendar },
          { path: "/doctors", label: "Doctors Management", icon: Stethoscope },
          { path: "/nurses", label: "Nurses Management", icon: UserCheck },
          { path: "/referrals", label: "Referrals", icon: ArrowRightLeft },
          {
            path: "/billing-insurance",
            label: "Billing & Insurance",
            icon: CreditCard,
          },
          {
            path: "/reports-analytics",
            label: "Reports & Analytics",
            icon: BarChart3,
          },
          { path: "/pharmacy", label: "Pharmacy Management", icon: Pill },
          { path: "/support", label: "Customer Support", icon: HelpCircle },
          { path: "/settings", label: "Settings", icon: Settings },
        ];

      case "super_admin":
        return [
          ...baseItems,
          { path: "/users", label: "Staff", icon: Users },
          { path: "/patients", label: "Patients", icon: UserPlus },
          { path: "/appointments", label: "Appointments", icon: Calendar },
          { path: "/billing", label: "Billing", icon: CreditCard },
        ];

      case "clinic_admin":
        return [
          ...baseItems,
          { path: "/patients", label: "Patients", icon: UserPlus },
          { path: "/appointments", label: "Appointments", icon: Calendar },
          { path: "/doctors", label: "Doctors", icon: Stethoscope },
          { path: "/settings", label: "Settings", icon: Settings },
        ];

      case "doctor":
        return [
          ...baseItems,
          { path: "/appointments", label: "Appointments", icon: Calendar },
          { path: "/patients", label: "Patients", icon: UserPlus },
        ];

      case "nurse":
        return [
          ...baseItems,
          { path: "/appointments", label: "Appointments", icon: Calendar },
          { path: "/patients", label: "Patients", icon: UserPlus },
        ];

      case "billing_staff":
        return [
          ...baseItems,
          { path: "/billing", label: "Billing", icon: CreditCard },
        ];

      case "pharmacy_staff":
        return [
          ...baseItems,
          { path: "/pharmacy", label: "Pharmacy", icon: Pill },
        ];

      case "patient":
        return [
          ...baseItems,
          { path: "/appointments", label: "My Appointments", icon: Calendar },
          { path: "/reports", label: "Medical Reports", icon: FileText },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems(user?.role);

  return (
    <div className="relative w-64 border-r border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-primary-600 h-9 w-9 grid place-content-center rounded-2xl text-white shadow-soft">
                <Heart className="h-5 w-5" />
              </div>
              <span className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full bg-primary-400 animate-pulseRing"></span>
            </div>
            <div className="leading-tight">
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">Smaart Health Care</span>
              <p className="text-[11px] text-gray-500 capitalize">
                {user?.role === "clinic_admin"
                  ? "Clinic Admin"
                  : user?.role?.replace("_", " ") || "User"}
              </p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="mt-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-card"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-soft"
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-mint-400"></span>}
                <Icon
                  className={`h-[18px] w-[18px] mr-3 transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-primary-600"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100 bg-white/70">
        <div className="flex items-center">
          <div className="bg-primary-600 h-10 w-10 rounded-full flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-xs">
              {user?.role === "clinic_admin"
                ? user?.adminName?.[0] || user?.name?.[0] || "C"
                : `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">
              {user?.role === "clinic_admin"
                ? user?.adminName || user?.name || "Clinic Admin"
                : `${user?.firstName || ""} ${user?.lastName || ""}`}
            </p>
            <p className="inline-flex items-center text-[11px] text-primary-700 font-medium capitalize bg-primary-50 px-2 py-0.5 rounded-full">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
