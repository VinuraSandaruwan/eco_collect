import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "bi bi-speedometer2",
    },
    {
      name: "Users",
      path: "/users",
      icon: "bi bi-people-fill",
    },
    {
      name: "Collectors",
      path: "/collectors",
      icon: "bi bi-person-badge-fill",
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: "bi bi-truck",
    },
    {
      name: "Schedules",
      path: "/schedules",
      icon: "bi bi-calendar-check-fill",
    },
    {
      name: "Pickup Requests",
      path: "/pickup-requests",
      icon: "bi bi-house-check-fill",
    },
    {
      name: "Complaints",
      path: "/complaints",
      icon: "bi bi-chat-left-text-fill",
    },
    {
      name: "Illegal Dumping",
      path: "/illegal-dumping",
      icon: "bi bi-exclamation-triangle-fill",
    },
    {
      name: "Marketplace",
      path: "/marketplace",
      icon: "bi bi-shop",
    },
    {
      name: "Community Events",
      path: "/community",
      icon: "bi bi-people",
    },
    {
      name: "Payments",
      path: "/payments",
      icon: "bi bi-credit-card-fill",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "bi bi-bar-chart-fill",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "bi bi-gear-fill",
    },
  ];

  return (
    <div
      className="d-flex flex-column p-3 text-white"
      style={{
        width: "260px",
        height: "100vh",
        background: "#198754",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Logo / Title */}
      <div className="text-center mb-3">
        <h5
          className="mb-0"
          style={{
            marginTop: "10px",
            fontWeight: "700",
          }}
        >
          Admin Panel
        </h5>
        <div 
          style={{ 
            marginTop: "-6px", 
            opacity: 0.4, 
            letterSpacing: "-1px" 
          }}
        >
          ________________________
        </div>
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item mb-2" key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "bg-dark" : ""}`
              }
              style={{
                borderRadius: "8px",
              }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="mt-auto">
        <button
          className="btn btn-light w-100"
          style={{
            fontWeight: "600",
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;