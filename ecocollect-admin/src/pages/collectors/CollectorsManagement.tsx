import { useState, useEffect } from "react";
import type { Collector } from "../../types/database.types";
import { getCollectors, addCollector, deleteCollector } from "../../services/apiService";

const statusColor: Record<Collector["status"], string> = {
  Active: "success",
  "On Leave": "warning",
  Inactive: "secondary",
};

function CollectorsManagement() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Adding New Collector (including NIC)
  const [form, setForm] = useState({
    nic: "",
    name: "",
    phone: "",
    assignedVehicle: "WP CAB-4521",
    assignedRoute: "Route A - Negombo North",
    shift: "Morning" as Collector["shift"],
  });

  const fetchCollectors = async () => {
    setLoading(true);
    const data = await getCollectors();
    setCollectors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  const handleAddCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.nic || !form.phone) return;
    setSubmitting(true);

    const created = await addCollector({
      nic: form.nic,
      name: form.name,
      phone: form.phone,
      assigned_vehicle: form.assignedVehicle,
      assigned_route: form.assignedRoute,
      shift: form.shift,
      status: "Active",
    });

    setCollectors((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      nic: "",
      name: "",
      phone: "",
      assignedVehicle: "WP CAB-4521",
      assignedRoute: "Route A - Negombo North",
      shift: "Morning",
    });
  };

  const handleDeleteCollector = async (id: string) => {
    setCollectors((prev) => prev.filter((c) => c.id !== id));
    await deleteCollector(id);
  };

  const filtered = collectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nic.toLowerCase().includes(search.toLowerCase()) ||
      (c.assigned_route && c.assigned_route.toLowerCase().includes(search.toLowerCase())) ||
      (c.assigned_vehicle && c.assigned_vehicle.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Collectors Management
          </h2>
          <p className="text-muted mb-0">
            Manage waste collection staff, verify employee NIC, and track vehicle/route assignments.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-person-plus"></i>
          Add New Collector
        </button>
      </div>

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Collectors</div>
              <div className="fs-3 fw-bold">{loading ? "..." : collectors.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Active</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : collectors.filter((c) => c.status === "Active").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">On Leave</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : collectors.filter((c) => c.status === "On Leave").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Inactive</div>
              <div className="fs-3 fw-bold text-secondary">
                {loading ? "..." : collectors.filter((c) => c.status === "Inactive").length}
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
              placeholder="Search by name, NIC, route, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "170px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Collector</th>
                <th>NIC Number</th>
                <th>Phone</th>
                <th>Assigned Vehicle</th>
                <th>Assigned Route</th>
                <th>Shift</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Fetching collectors from Supabase...
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fw-bold"
                          style={{ width: "34px", height: "34px", fontSize: "13px" }}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-semibold">{c.name}</div>
                          <div className="small text-muted">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace small fw-semibold text-dark">{c.nic}</span>
                    </td>
                    <td className="small">{c.phone}</td>
                    <td className="small">{c.assigned_vehicle}</td>
                    <td className="small text-muted">{c.assigned_route}</td>
                    <td className="small">{c.shift}</td>
                    <td>
                      <span className={`badge bg-${statusColor[c.status] || "secondary"}-subtle text-${statusColor[c.status] || "secondary"}-emphasis`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-light me-1" title="Edit">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-light text-danger"
                        title="Delete"
                        onClick={() => handleDeleteCollector(c.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No collectors match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {collectors.length} collectors
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Add New Collector Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Register New Collector</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddCollector}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Full Name / Staff Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A. Kumara"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        NIC Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 199512345678 / 951234567V"
                        value={form.nic}
                        onChange={(e) => setForm({ ...form, nic: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 077 345 6789"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assigned Vehicle
                      </label>
                      <select
                        className="form-select"
                        value={form.assignedVehicle}
                        onChange={(e) => setForm({ ...form, assignedVehicle: e.target.value })}
                      >
                        <option value="WP CAB-4521">WP CAB-4521</option>
                        <option value="WP CAD-7743">WP CAD-7743</option>
                        <option value="WP CAE-1290">WP CAE-1290</option>
                        <option value="WP CAF-6602">WP CAF-6602</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Shift
                      </label>
                      <select
                        className="form-select"
                        value={form.shift}
                        onChange={(e) =>
                          setForm({ ...form, shift: e.target.value as Collector["shift"] })
                        }
                      >
                        <option value="Morning">Morning (06:00 - 14:00)</option>
                        <option value="Evening">Evening (14:00 - 22:00)</option>
                        <option value="Night">Night (22:00 - 06:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Assigned Route / Sector
                    </label>
                    <select
                      className="form-select"
                      value={form.assignedRoute}
                      onChange={(e) => setForm({ ...form, assignedRoute: e.target.value })}
                    >
                      <option value="Route A - Negombo North">Route A - Negombo North</option>
                      <option value="Route B - Negombo South">Route B - Negombo South</option>
                      <option value="Route C - Kochchikade">Route C - Kochchikade</option>
                      <option value="Route D - Kandana">Route D - Kandana</option>
                      <option value="Route E - Central Market">Route E - Central Market</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Registering..." : "Register Collector"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectorsManagement;