import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DumpingReport } from "../../types/database.types";
import { getDumpingReports, addDumpingReport, updateDumpingStatus } from "../../services/apiService";

// Real Colombo Municipal Council (CMC) Zones with Exact Coordinates
const COLOMBO_ZONES: Record<string, { lat: number; lng: number }> = {
  "Colombo 01 - Fort": { lat: 6.9344, lng: 79.8428 },
  "Colombo 02 - Slave Island": { lat: 6.9218, lng: 79.8562 },
  "Colombo 03 - Kollupitiya": { lat: 6.9083, lng: 79.8508 },
  "Colombo 04 - Bambalapitiya": { lat: 6.8920, lng: 79.8560 },
  "Colombo 05 - Havelock Town / Kirulapone": { lat: 6.8833, lng: 79.8735 },
  "Colombo 06 - Wellawatte": { lat: 6.8743, lng: 79.8610 },
  "Colombo 07 - Cinnamon Gardens": { lat: 6.9067, lng: 79.8708 },
  "Colombo 08 - Borella": { lat: 6.9147, lng: 79.8778 },
  "Colombo 09 - Dematagoda": { lat: 6.9298, lng: 79.8789 },
  "Colombo 10 - Maradana": { lat: 6.9261, lng: 79.8654 },
  "Colombo 13 - Kochchikade": { lat: 6.9480, lng: 79.8560 },
  "Colombo 14 - Grandpass": { lat: 6.9530, lng: 79.8700 },
  "Colombo 15 - Mattakkuliya": { lat: 6.9720, lng: 79.8680 },
};

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
    zone: "Colombo 09 - Dematagoda",
    severity: "Standard" as DumpingReport["severity"],
    assignedOfficer: "",
    lat: "6.9298",
    lng: "79.8789",
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

  // When Zone dropdown changes in form, auto-set lat/lng to Colombo zone
  const handleZoneChange = (zoneName: string) => {
    const coords = COLOMBO_ZONES[zoneName] || { lat: 6.9271, lng: 79.8612 };
    // Add tiny random offset so newly added pins in same zone don't stack directly on top
    const offsetLat = (coords.lat + (Math.random() - 0.5) * 0.006).toFixed(4);
    const offsetLng = (coords.lng + (Math.random() - 0.5) * 0.006).toFixed(4);
    setForm({
      ...form,
      zone: zoneName,
      lat: offsetLat,
      lng: offsetLng,
    });
  };

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
      lat: parseFloat(form.lat) || 6.9298,
      lng: parseFloat(form.lng) || 79.8789,
    });

    setIncidents((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      title: "",
      location: "",
      zone: "Colombo 09 - Dematagoda",
      severity: "Standard",
      assignedOfficer: "",
      lat: "6.9298",
      lng: "79.8789",
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

  // Colombo Municipal Council Map Center
  const centerLat = 6.9271;
  const centerLng = 79.8612;

  // Helper to ensure overlapping pins get spread out visually so ALL pins are distinct
  const getDeconflictedCoordinates = (incident: DumpingReport, index: number): [number, number] => {
    let lat = incident.lat || centerLat;
    let lng = incident.lng || centerLng;

    // Check if another report has the exact same lat/lng
    const duplicates = incidents.filter((other, idx) => idx < index && Math.abs((other.lat || centerLat) - lat) < 0.0001 && Math.abs((other.lng || centerLng) - lng) < 0.0001);
    if (duplicates.length > 0) {
      // Offset position in a spiral ring around the coordinate
      const angle = (duplicates.length * 2.1);
      const radius = 0.003 * Math.sqrt(duplicates.length);
      lat = lat + Math.sin(angle) * radius;
      lng = lng + Math.cos(angle) * radius;
    }
    return [lat, lng];
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Illegal Dumping Management
          </h2>
          <p className="text-muted mb-0">
            Colombo Municipal Council Hotspot Monitoring & Incident Tracking.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i> Log Incident Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-3 d-flex flex-wrap gap-3 align-items-center">
          <div className="d-flex align-items-center gap-2 text-muted me-2">
            <i className="bi bi-funnel"></i>
            <span className="fw-semibold small">Filters:</span>
          </div>
          <select
            className="form-select form-select-sm"
            style={{ width: "160px" }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="Urgent">Urgent</option>
            <option value="Standard">Standard</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="form-select form-select-sm"
            style={{ width: "160px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
          </select>

          {(severityFilter || statusFilter) && (
            <button
              className="btn btn-link btn-sm text-decoration-none ms-auto text-success"
              onClick={() => {
                setSeverityFilter("");
                setStatusFilter("");
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">
                  Active Hotspots
                </span>
                <div
                  className="rounded d-flex align-items-center justify-content-center bg-danger-subtle text-danger"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold">
                {loading ? "..." : incidents.filter((i) => i.status !== "Resolved").length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">
                  Total Reported Incidents
                </span>
                <div
                  className="rounded d-flex align-items-center justify-content-center bg-success-subtle text-success"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-clipboard-data"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold">{loading ? "..." : incidents.length}</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">
                  Pending Resolution
                </span>
                <div
                  className="rounded d-flex align-items-center justify-content-center bg-warning-subtle text-warning"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-clock-history"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold text-warning">
                {loading
                  ? "..."
                  : incidents.filter((i) => i.status === "Assigned").length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">
                  Resolved
                </span>
                <div
                  className="rounded d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold text-success">
                {loading
                  ? "..."
                  : incidents.filter((i) => i.status === "Resolved").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map & Incidents List */}
      <div className="row g-4">
        {/* Map Section */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span>Colombo Municipal Council Hotspot Map</span>
              <span className="badge bg-secondary-subtle text-secondary-emphasis">
                GPS Telemetry
              </span>
            </div>
            <div style={{ height: "520px", width: "100%" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                  <div className="spinner-border spinner-border-sm text-success me-2"></div>
                  Loading hotspot map...
                </div>
              ) : (
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filtered.map((incident, idx) => {
                    const pos = getDeconflictedCoordinates(incident, idx);
                    return (
                      <Marker
                        key={incident.id}
                        position={pos}
                        icon={createPin(incident.severity)}
                      >
                        <Popup>
                          <strong className="text-danger">{incident.title}</strong>
                          <br />
                          <strong>Location:</strong> {incident.location} ({incident.zone})
                          <br />
                          <strong>Severity:</strong> {incident.severity}
                          <br />
                          <strong>Status:</strong> {incident.status}
                          <br />
                          <strong>Reported:</strong> {incident.reported_ago}
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Incident Feed */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3">Incident Feed</div>
            <div
              className="list-group list-group-flush overflow-y-auto"
              style={{ maxHeight: "520px" }}
            >
              {loading ? (
                <div className="p-4 text-center text-muted">Loading incidents...</div>
              ) : (
                filtered.map((incident) => (
                  <div key={incident.id} className="list-group-item p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold mb-0 text-dark">{incident.title}</h6>
                      <span
                        className={`badge bg-${severityBadge[incident.severity].bg}-subtle text-${severityBadge[incident.severity].bg}-emphasis`}
                      >
                        <i
                          className={`bi ${severityBadge[incident.severity].icon} me-1`}
                        ></i>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {incident.location} ({incident.zone})
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">{incident.reported_ago}</span>
                      <select
                        className="form-select form-select-sm border-0 bg-light fw-medium"
                        style={{ width: "120px" }}
                        value={incident.status}
                        onChange={(e) =>
                          handleStatusChange(incident.id, e.target.value as DumpingReport["status"])
                        }
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
                <div className="p-4 text-center text-muted">No incidents found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Report Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Log New Dumping Incident</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddReport}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Incident Title / Description
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bulk Waste Dumped near Main Market"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Location / Street Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 142 Galle Road, Kollupitiya"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        CMC Zone
                      </label>
                      <select
                        className="form-select"
                        value={form.zone}
                        onChange={(e) => handleZoneChange(e.target.value)}
                      >
                        {Object.keys(COLOMBO_ZONES).map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Severity Level
                      </label>
                      <select
                        className="form-select"
                        value={form.severity}
                        onChange={(e) =>
                          setForm({ ...form, severity: e.target.value as DumpingReport["severity"] })
                        }
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="Standard">Standard</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Assigned Municipal Officer (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Officer K. Bandara"
                      value={form.assignedOfficer}
                      onChange={(e) => setForm({ ...form, assignedOfficer: e.target.value })}
                    />
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
                  <button
                    type="submit"
                    className="btn btn-success btn-sm px-3"
                    disabled={submitting}
                  >
                    {submitting ? "Logging..." : "Log Incident"}
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