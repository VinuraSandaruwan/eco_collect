import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/fleet", icon: "local_shipping", label: "Fleet" },
  { to: "/complaints", icon: "report_problem", label: "Issues" },
  { to: "/marketplace", icon: "storefront", label: "Marketplace" },
  { to: "/community", icon: "group", label: "Community" },
];

function Sidebar() {
  return (
    <nav className="bg-secondary w-[260px] h-screen sticky left-0 top-0 shadow-sm hidden md:flex flex-col border-r border-outline z-40">
      <div className="p-6 border-b border-on-secondary-fixed-variant">
        <h1 className="text-2xl font-semibold text-white">EcoCollect</h1>
        <p className="text-xs text-secondary-fixed-dim mt-1">City Oversight</p>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "text-white border-l-4 border-primary-container bg-on-secondary-fixed-variant"
                  : "text-secondary-fixed-dim hover:text-white hover:bg-on-secondary-fixed-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-xs font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto border-t border-on-secondary-fixed-variant py-4 flex flex-col gap-1">
        <a className="flex items-center gap-3 px-4 py-3 text-secondary-fixed-dim hover:text-white hover:bg-on-secondary-fixed-variant transition-colors duration-200 cursor-pointer">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-semibold tracking-wide">Settings</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-secondary-fixed-dim hover:text-white hover:bg-on-secondary-fixed-variant transition-colors duration-200 cursor-pointer">
          <span className="material-symbols-outlined">help</span>
          <span className="text-xs font-semibold tracking-wide">Support</span>
        </a>
      </div>
    </nav>
  );
}

export default Sidebar;