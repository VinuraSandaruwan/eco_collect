function DashboardOverview() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h2
          className="fw-bold"
          style={{
            color: "#212529",
          }}
        >
          Dashboard
        </h2>
        <p className="text-muted">
          Welcome to Smart Waste Management Admin Portal
        </p>
      </div>

{/* Summary Cards */}
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 position-relative overflow-hidden">
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
              <h2 className="fw-bold mb-1">1,250</h2>
              <div className="d-flex align-items-center gap-1 small" style={{ color: "#198754" }}>
                <i className="bi bi-arrow-up"></i>
                <span>+8% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 position-relative overflow-hidden">
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
              <h2 className="fw-bold mb-1">25</h2>
              <div className="d-flex align-items-center gap-1 small text-muted">
                <span className="rounded-circle" style={{ width: "6px", height: "6px", backgroundColor: "#0d6efd", display: "inline-block" }}></span>
                <span>92% Fleet Utilization</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Complaints
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
              <h2 className="fw-bold mb-1">45</h2>
              <div className="d-flex align-items-center gap-1 small" style={{ color: "#dc3545" }}>
                <i className="bi bi-arrow-up"></i>
                <span>+5 since last hour</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted text-uppercase small fw-semibold mb-0">
                  Collections Today
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
              <h2 className="fw-bold mb-1">180</h2>
              <div className="d-flex align-items-center gap-1 small text-muted">
                <i className="bi bi-clock"></i>
                <span>Updated 5 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dashboard Section */}
      <div className="row g-4 mt-2">
        {/* Recent Activities */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Recent Activities</h5>
              <div className="border-bottom py-2">
                <i className="bi bi-person-plus text-success me-2"></i>
                New user registered
              </div>
              <div className="border-bottom py-2">
                <i className="bi bi-truck text-primary me-2"></i>
                Vehicle completed waste collection
              </div>
              <div className="border-bottom py-2">
                <i className="bi bi-exclamation-circle text-danger me-2"></i>
                New complaint submitted
              </div>
              <div className="py-2">
                <i className="bi bi-recycle text-success me-2"></i>
                Recycling process updated
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Tracking Preview */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <i
                className="bi bi-geo-alt-fill"
                style={{
                  fontSize: "45px",
                  color: "#198754",
                }}
              ></i>
              <h5 className="fw-bold mt-3">Live Vehicle Tracking</h5>
              <p className="text-muted">
                Monitor waste collection vehicles in real time
              </p>
              <button className="btn btn-success">View Tracking</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;