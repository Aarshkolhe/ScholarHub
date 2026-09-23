import { useState } from "react";
import { Menu, Shield, Bell } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import useAuth from "../../hooks/useAuth";

export default function AdminLayout({ children, title = "Admin Portal" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              user?.role === "super_admin"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}>
              <Shield size={14} />
              <span className="capitalize">{user?.role?.replace("_", " ") || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
