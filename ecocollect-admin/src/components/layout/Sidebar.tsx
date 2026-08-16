import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/users", icon: "bi-people", label: "Users" },
  { to: "/collectors", icon: "bi-person-badge", label: "Collectors" },
  { to: "/fleet", icon: "bi-truck", label: "Vehicles" },
  { to: "/schedules", icon: "bi-calendar-week", label: "Schedules" },
  { to: "/complaints", icon: "bi-exclamation-octagon", label: "Complaints" },
  { to: "/illegal-dumping", icon: "bi-trash3", label: "Illegal Dumping" },
  { to: "/marketplace", icon: "bi-shop", label: "Marketplace" },
  { to: "/community", icon: "bi-people-fill", label: "Community Events" },
  { to: "/payments", icon: "bi-credit-card", label: "Payments" },
  { to: "/reports", icon: "bi-file-earmark-bar-graph", label: "Reports" },
];

function Sidebar() {
  return (
    <aside
      className="d-flex flex-column text-white p-3 shadow"
      style={{
        width: "260px",
        minHeight: "100vh",
        backgroundColor: "#006c40", // EcoCollect municipal green
        position: "sticky",
        top: 0,
        zIndex: 1020,
      }}
    >
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2 pb-3 border-bottom border-white border-opacity-25">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-white text-success fw-bold"
          style={{ width: "36px", height: "36px" }}
        >
          <i className="bi bi-recycle fs-5"></i>
        </div>
        <div>
          <h5 className="fw-bold mb-0 text-white leading-none">EcoCollect</h5>
          <small className="text-white-50" style={{ fontSize: "11px" }}>
            City Municipal Admin
          </small>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="nav nav-pills flex-column gap-1 flex-grow-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 text-white py-2 px-3 rounded ${
                isActive
                  ? "active fw-bold"
                  : "text-white-50 hover-light"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#00522f" : "transparent",
            })}
          >
            <i className={`bi ${item.icon}`}></i>
            <span style={{ fontSize: "14px" }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings Footer */}
      <div className="pt-3 border-top border-white border-opacity-25">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 text-white py-2 px-3 rounded ${
              isActive ? "active fw-bold" : "text-white-50"
            }`
          }
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#00522f" : "transparent",
          })}
        >
          <i className="bi bi-gear"></i>
          <span style={{ fontSize: "14px" }}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;