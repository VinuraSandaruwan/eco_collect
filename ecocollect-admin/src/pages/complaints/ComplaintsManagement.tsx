import { useState } from "react";

interface Complaint {
  id: string;
  citizen: string;
  zone: string;
  category: "Missed Pickup" | "Bin Damage" | "Late Collection" | "Staff Behavior" | "Other";
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  dateSubmitted: string;
}

const initialComplaints: Complaint[] = [
  {
    id: "CMP-101",
    citizen: "A. Wickramasinghe",
    zone: "Negombo North",
    category: "Missed Pickup",
    description: "Waste not collected for 2 days on Lake Road.",
    priority: "High",
    status: "Open",
    dateSubmitted: "Aug 10, 2026",
  },
  {
    id: "CMP-102",
    citizen: "N. Rajapaksha",
    zone: "Negombo South",
    category: "Bin Damage",
    description: "Bin lid broken after last collection.",
    priority: "Low",
    status: "In Progress",
    dateSubmitted: "Aug 09, 2026",
  },
  {
    id: "CMP-103",
    citizen: "T. Gunasekara",
    zone: "Kochchikade",
    category: "Late Collection",
    description: "Truck arrived 3 hours later than scheduled.",
    priority: "Medium",
    status: "Resolved",
    dateSubmitted: "Aug 07, 2026",
  },
  {
    id: "CMP-104",
    citizen: "D. Herath",
    zone: "Kandana",
    category: "Staff Behavior",
    description: "Collector was rude when asked about schedule.",
    priority: "Medium",
    status: "Open",
    dateSubmitted: "Aug 11, 2026",
  },
];

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
  const [complaints] = useState<Complaint[]>(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.citizen.toLowerCase().includes(search.toLowerCase()) ||
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
        <h2 className="fw-bold mb-1">Complaints Management</h2>
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
              <div className="fs-3 fw-bold">{complaints.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Open</div>
              <div className="fs-3 fw-bold text-danger">
                {complaints.filter((c) => c.status === "Open").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">In Progress</div>
              <div className="fs-3 fw-bold text-warning">
                {complaints.filter((c) => c.status === "In Progress").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Resolved</div>
              <div className="fs-3 fw-bold text-success">
                {complaints.filter((c) => c.status === "Resolved").length}
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
            <i className="bi bi-search position-absolute text-muted" style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by citizen, zone, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select"
              style={{ minWidth: "160px" }}
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
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Citizen</th>
                <th>Zone</th>
                <th>Category</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="fw-semibold">{c.citizen}</div>
                    <div className="small text-muted">{c.id}</div>
                  </td>
                  <td className="small">{c.zone}</td>
                  <td className="small">{c.category}</td>
                  <td className="small text-muted" style={{ maxWidth: "220px" }}>
                    {c.description}
                  </td>
                  <td>
                    <span className={`badge bg-${priorityColor[c.priority]}-subtle text-${priorityColor[c.priority]}-emphasis`}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${statusColor[c.status]}-subtle text-${statusColor[c.status]}-emphasis`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="small text-muted">{c.dateSubmitted}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-light me-1" title="View / Resolve">
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="btn btn-sm btn-light text-danger" title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No complaints match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {complaints.length} complaints
          </span>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsManagement;