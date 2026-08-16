import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getResidents, getTrucks, getComplaints, getSchedules } from "../../services/apiService";

function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usersCount: 0,
    trucksCount: 0,
    complaintsCount: 0,
    schedulesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      setLoading(true);
      const [users, trucks, complaints, schedules] = await Promise.all([
        getResidents(),
        getTrucks(),
        getComplaints(),
        getSchedules(),
      ]);

      setStats({
        usersCount: users.length,
        trucksCount: trucks.length,
        complaintsCount: complaints.filter((c) => c.status !== "Resolved").length,
        schedulesCount: schedules.length,
      });
      setLoading(false);
    }

    loadDashboardStats();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "#212529" }}>
          Dashboard
        </h2>
        <p className="text-muted mb-0">
          Welcome to Smart Waste Management Municipal Portal
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4">
        <div className="col-md-3" style={{ cursor: "pointer" }} onClick={() => navigate("/users")}>
          <div className="card shadow-sm border-0 position-relative overflow-hidden h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Total Users
                </h6>
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(25, 135, 84, 0.1)",
                  }}
                >
                  <i className="bi bi-people-fill" style={{ color: "#198754" }}></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{loading ? "..." : stats.usersCount}</h2>
              <div className="d-flex align-items-center gap-1 small text-success">
                <i className="bi bi-check-circle-fill me-1"></i>
                <span>Registered residents</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ cursor: "pointer" }} onClick={() => navigate("/vehicles")}>
          <div className="card shadow-sm border-0 position-relative overflow-hidden h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Active Vehicles
                </h6>
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(13, 110, 253, 0.1)",
                  }}
                >
                  <i className="bi bi-truck" style={{ color: "#0d6efd" }}></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{loading ? "..." : stats.trucksCount}</h2>
              <div className="d-flex align-items-center gap-1 small text-muted">
                <span className="rounded-circle" style={{ width: "6px", height: "6px", backgroundColor: "#0d6efd", display: "inline-block" }}></span>
                <span>Fleet telemetry live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ cursor: "pointer" }} onClick={() => navigate("/complaints")}>
          <div className="card shadow-sm border-0 position-relative overflow-hidden h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Active Complaints
                </h6>
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(220, 53, 69, 0.1)",
                  }}
                >
                  <i className="bi bi-exclamation-circle-fill" style={{ color: "#dc3545" }}></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{loading ? "..." : stats.complaintsCount}</h2>
              <div className="d-flex align-items-center gap-1 small text-danger">
                <i className="bi bi-clock-history me-1"></i>
                <span>Pending resolution</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ cursor: "pointer" }} onClick={() => navigate("/schedules")}>
          <div className="card shadow-sm border-0 position-relative overflow-hidden h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Scheduled Runs
                </h6>
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(25, 135, 84, 0.1)",
                  }}
                >
                  <i className="bi bi-recycle" style={{ color: "#198754" }}></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{loading ? "..." : stats.schedulesCount}</h2>
              <div className="d-flex align-items-center gap-1 small text-muted">
                <i className="bi bi-calendar-event me-1"></i>
                <span>Route dispatches</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dashboard Section */}
      <div className="row g-4 mt-2">
        {/* Recent Activities */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Recent System Activity</h5>
              <div className="border-bottom py-2.5 d-flex align-items-center">
                <i className="bi bi-person-plus text-success me-2 fs-5"></i>
                <span>New resident registered on system</span>
              </div>
              <div className="border-bottom py-2.5 d-flex align-items-center">
                <i className="bi bi-truck text-primary me-2 fs-5"></i>
                <span>Vehicle telemetry updated on GPS map</span>
              </div>
              <div className="border-bottom py-2.5 d-flex align-items-center">
                <i className="bi bi-exclamation-circle text-danger me-2 fs-5"></i>
                <span>Incident report recorded in illegal dumping</span>
              </div>
              <div className="py-2.5 d-flex align-items-center">
                <i className="bi bi-recycle text-success me-2 fs-5"></i>
                <span>Recycling marketplace batch updated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Tracking Preview */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center p-4">
              <div
                className="rounded-circle bg-success-subtle p-3 mb-3 d-flex align-items-center justify-content-center"
                style={{ width: "70px", height: "70px" }}
              >
                <i className="bi bi-geo-alt-fill text-success fs-1"></i>
              </div>
              <h5 className="fw-bold mb-1">Live Vehicle Tracking</h5>
              <p className="text-muted small mb-4">
                Monitor waste collection vehicles & GPS telemetry in real time
              </p>
              <Link to="/vehicles" className="btn btn-success px-4 py-2 shadow-sm d-inline-flex align-items-center gap-2">
                <i className="bi bi-map-fill"></i>
                View Live Vehicle Tracking Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;