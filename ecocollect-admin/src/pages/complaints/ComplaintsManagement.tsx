import { useState, useEffect } from "react";
import type { Complaint } from "../../types/database.types";
import { getComplaints, updateComplaintStatus } from "../../services/apiService";

const priorityColor: Record<Complaint["priority"], string> = {
  Low: "secondary",
  Medium: "warning",
  High: "danger",
};

const statusColor: Record<Complaint["status"], string> = {
  Open: "danger",
  "In Progress": "warning",
  Resolved: "success",
};

function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    const data = await getComplaints();
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Complaint["status"]) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    await updateComplaintStatus(id, newStatus);
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.resident_name.toLowerCase().includes(search.toLowerCase()) ||
      c.zone.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
          Complaints Management
        </h2>
        <p className="text-muted mb-0">
          Review and resolve citizen complaints about collection service.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Complaints</div>
              <div className="fs-3 fw-bold">{loading ? "..." : complaints.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Open</div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : complaints.filter((c) => c.status === "Open").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">In Progress</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : complaints.filter((c) => c.status === "In Progress").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Resolved</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : complaints.filter((c) => c.status === "Resolved").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        {/* Controls */}
        <div className="card-header bg-white d-flex flex-wrap gap-3 justify-content-between align-items-center py-3">
          <div className="position-relative" style={{ minWidth: "260px", flex: 1 }}>
            <i
              className="bi bi-search position-absolute text-muted"
              style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
            ></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by citizen, zone, or complaint detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "150px" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Missed Pickup">Missed Pickup</option>
            <option value="Bin Damage">Bin Damage</option>
            <option value="Late Collection">Late Collection</option>
            <option value="Staff Behavior">Staff Behavior</option>
            <option value="Other">Other</option>
          </select>
          <select
            className="form-select"
            style={{ minWidth: "150px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Ticket ID</th>
                <th>Citizen</th>
                <th>Zone</th>
                <th>Category</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching complaints from Supabase...
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold text-dark">{c.ticket_id || c.id}</td>
                    <td>{c.resident_name}</td>
                    <td className="small text-muted">{c.zone}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{c.category}</span>
                    </td>
                    <td className="small" style={{ maxWidth: "300px" }}>
                      {c.description}
                    </td>
                    <td>
                      <span className={`badge bg-${priorityColor[c.priority] || "secondary"}-subtle text-${priorityColor[c.priority] || "secondary"}-emphasis`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 bg-${statusColor[c.status] || "secondary"}-subtle text-${statusColor[c.status] || "secondary"}-emphasis fw-semibold`}
                        style={{ width: "130px" }}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as Complaint["status"])}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No complaints match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsManagement;