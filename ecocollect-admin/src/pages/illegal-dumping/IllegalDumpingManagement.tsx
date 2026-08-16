import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DumpingReport } from "../../types/database.types";
import { getDumpingReports, addDumpingReport, updateDumpingStatus } from "../../services/apiService";

const severityBadge: Record<DumpingReport["severity"], { bg: string; icon: string }> = {
  Urgent: { bg: "danger", icon: "bi-exclamation-circle-fill" },
  Standard: { bg: "secondary", icon: "bi-info-circle-fill" },
  Low: { bg: "success", icon: "bi-check-circle-fill" },
};

function createPin(severity: DumpingReport["severity"]) {
  const color =
    severity === "Urgent" ? "#dc3545" : severity === "Standard" ? "#6c757d" : "#198754";
  return L.divIcon({
    className: "custom-dumping-marker",
    html: `<div style="
      width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.35); border: 2px solid white;
    ">
      <i class="bi bi-exclamation-triangle-fill" style="color: white; font-size: 13px; transform: rotate(45deg);"></i>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

function IllegalDumpingManagement() {
  const [incidents, setIncidents] = useState<DumpingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for New Report
  const [form, setForm] = useState({
    title: "",
    location: "",
    zone: "Negombo North",
    severity: "Standard" as DumpingReport["severity"],
    assignedOfficer: "",
    lat: "7.2000",
    lng: "79.8400",
  });

  const fetchReports = async () => {
    setLoading(true);
    const data = await getDumpingReports();
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location) return;
    setSubmitting(true);

    const created = await addDumpingReport({
      title: form.title,
      location: form.location,
      zone: form.zone,
      severity: form.severity,
      status: form.assignedOfficer ? "Assigned" : "Unassigned",
      reported_ago: "Just now",
      assigned_officer: form.assignedOfficer || undefined,
      lat: parseFloat(form.lat) || 7.2000,
      lng: parseFloat(form.lng) || 79.8400,
    });

    setIncidents((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      title: "",
      location: "",
      zone: "Negombo North",
      severity: "Standard",
      assignedOfficer: "",
      lat: "7.2000",
      lng: "79.8400",
    });
  };

  const handleStatusChange = async (id: string, newStatus: DumpingReport["status"]) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    await updateDumpingStatus(id, newStatus);
  };

  const filtered = incidents.filter((i) => {
    const matchesSeverity = severityFilter ? i.severity === severityFilter : true;
    const matchesStatus = statusFilter ? i.status === statusFilter : true;
    return matchesSeverity && matchesStatus;
  });

  const centerLat = 7.15;
  const centerLng = 79.87;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Illegal Dumping Management
          </h2>
          <p className="text-muted mb-0">
            Monitor, assign, and resolve unauthorized waste disposal hotspots.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-download"></i>
            Export Data
          </button>
          <button
            className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            Add New Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-3 py-3">
          <span className="text-muted d-flex align-items-center gap-2">
            <i className="bi bi-funnel"></i>
            Filters:
          </span>
          <select
            className="form-select"
            style={{ maxWidth: "180px" }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="Urgent">Urgent</option>
            <option value="Standard">Standard</option>
            <option value="Low">Low</option>
          </select>
          <select
            className="form-select"
            style={{ maxWidth: "180px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            className="btn btn-link text-success text-decoration-none ms-auto"
            onClick={() => {
              setSeverityFilter("");
              setStatusFilter("");
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{ width: "44px", height: "44px", backgroundColor: "rgba(220,53,69,0.1)" }}
                >
                  <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                </div>
              </div>
              <div className="text-muted small mb-1">Total Active Hotspots</div>
              <div className="fs-3 fw-bold">{loading ? "..." : incidents.filter((i) => i.status !== "Resolved").length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div
                className="d-flex align-items-center justify-content-center rounded mb-2"
                style={{ width: "44px", height: "44px", backgroundColor: "rgba(25,135,84,0.1)" }}
              >
                <i className="bi bi-clipboard-check text-success"></i>
              </div>
              <div className="text-muted small mb-1">Total Reported Incidents</div>
              <div className="fs-3 fw-bold">{loading ? "..." : incidents.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div
                className="d-flex align-items-center justify-content-center rounded mb-2"
                style={{ width: "44px", height: "44px", backgroundColor: "rgba(255,193,7,0.1)" }}
              >
                <i className="bi bi-clock-history text-warning"></i>
              </div>
              <div className="text-muted small mb-1">Pending Resolution</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : incidents.filter((i) => i.status === "Unassigned").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div
                className="d-flex align-items-center justify-content-center rounded mb-2"
                style={{ width: "44px", height: "44px", backgroundColor: "rgba(13,110,253,0.1)" }}
              >
                <i className="bi bi-check-circle-fill text-primary"></i>
              </div>
              <div className="text-muted small mb-1">Resolved</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : incidents.filter((i) => i.status === "Resolved").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Map + List */}
      <div className="row g-4 mb-4">
        {/* Left Column: Interactive Map */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 fw-bold d-flex justify-content-between align-items-center">
              <span>Hotspot Map Overview</span>
              <span className="badge bg-secondary-subtle text-secondary-emphasis font-monospace">
                GPS Map Telemetry
              </span>
            </div>
            <div className="card-body p-0" style={{ minHeight: "480px" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted p-5">
                  <div className="spinner-border spinner-border-sm text-success me-2"></div>
                  Loading hotspot map...
                </div>
              ) : (
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={12}
                  style={{ height: "480px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filtered.map((item) => (
                    <Marker
                      key={item.id}
                      position={[item.lat, item.lng]}
                      icon={createPin(item.severity)}
                    >
                      <Popup>
                        <strong>{item.title}</strong> ({item.id})
                        <br />
                        <strong>Location:</strong> {item.location}
                        <br />
                        <strong>Severity:</strong> {item.severity}
                        <br />
                        <strong>Status:</strong> {item.status}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Incident List */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 fw-bold">Incident Feed</div>
            <div className="card-body p-0 overflow-y-auto" style={{ maxHeight: "480px" }}>
              {loading ? (
                <div className="p-4 text-center text-muted">Loading incidents...</div>
              ) : (
                filtered.map((item) => (
                  <div key={item.id} className="p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="fw-bold">{item.title}</div>
                      <span className={`badge bg-${severityBadge[item.severity]?.bg || "secondary"}-subtle text-${severityBadge[item.severity]?.bg || "secondary"}-emphasis`}>
                        <i className={`bi ${severityBadge[item.severity]?.icon} me-1`}></i>
                        {item.severity}
                      </span>
                    </div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {item.location} ({item.zone})
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">{item.reported_ago}</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "130px" }}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as DumpingReport["status"])}
                      >
                        <option value="Unassigned">Unassigned</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <div className="p-4 text-center text-muted">No dumping incidents found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Report Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Log Illegal Dumping Incident</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddReport}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Incident Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Abandoned Construction Debris"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Location / Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Near Beach Road Bridge"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Zone</label>
                      <select
                        className="form-select"
                        value={form.zone}
                        onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      >
                        <option value="Negombo North">Negombo North</option>
                        <option value="Negombo South">Negombo South</option>
                        <option value="Kochchikade">Kochchikade</option>
                        <option value="Kandana">Kandana</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Severity</label>
                      <select
                        className="form-select"
                        value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value as DumpingReport["severity"] })}
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="Standard">Standard</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Incident Report"}
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

export default IllegalDumpingManagement;