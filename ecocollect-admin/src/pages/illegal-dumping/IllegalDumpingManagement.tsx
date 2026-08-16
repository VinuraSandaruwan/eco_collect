import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { DumpingReport } from "../../types/database.types";
import { getDumpingReports, addDumpingReport, updateDumpingStatus } from "../../services/apiService";
import { supabase } from "../../services/supabaseClient";

// Colombo Municipal Council (CMC) 15 Official Controlling Districts
export const CMC_COLOMBO_ZONES: Record<string, { lat: number; lng: number }> = {
  "Colombo 01 - Fort / Pettah": { lat: 6.9344, lng: 79.8428 },
  "Colombo 02 - Slave Island / Union Place": { lat: 6.9218, lng: 79.8562 },
  "Colombo 03 - Kollupitiya": { lat: 6.9083, lng: 79.8508 },
  "Colombo 04 - Bambalapitiya": { lat: 6.8920, lng: 79.8560 },
  "Colombo 05 - Havelock Town / Kirulapone": { lat: 6.8833, lng: 79.8735 },
  "Colombo 06 - Wellawatte": { lat: 6.8743, lng: 79.8610 },
  "Colombo 07 - Cinnamon Gardens / Town Hall": { lat: 6.9142, lng: 79.8610 },
  "Colombo 08 - Borella": { lat: 6.9147, lng: 79.8778 },
  "Colombo 09 - Dematagoda": { lat: 6.9298, lng: 79.8789 },
  "Colombo 10 - Maradana": { lat: 6.9261, lng: 79.8654 },
  "Colombo 11 - Pettah Market": { lat: 6.9380, lng: 79.8520 },
  "Colombo 12 - Kotahena": { lat: 6.9450, lng: 79.8580 },
  "Colombo 13 - Kochchikade": { lat: 6.9480, lng: 79.8560 },
  "Colombo 14 - Grandpass": { lat: 6.9530, lng: 79.8700 },
  "Colombo 15 - Mattakkuliya / Modara": { lat: 6.9720, lng: 79.8680 },
};

const severityBadge: Record<DumpingReport["severity"], { bg: string; icon: string }> = {
  Urgent: { bg: "danger", icon: "bi-exclamation-circle-fill" },
  Standard: { bg: "secondary", icon: "bi-info-circle-fill" },
  Low: { bg: "success", icon: "bi-check-circle-fill" },
};

function createPin(severity: DumpingReport["severity"], status: DumpingReport["status"]) {
  let color = "#dc3545"; // Default Red for Unassigned
  let iconClass = "bi-exclamation-triangle-fill";

  if (status === "Resolved") {
    color = "#198754"; // Green for Resolved
    iconClass = "bi-check-circle-fill";
  } else if (status === "Assigned") {
    color = "#fd7e14"; // Orange for Assigned
    iconClass = "bi-person-check-fill";
  } else {
    color = severity === "Urgent" ? "#dc3545" : severity === "Standard" ? "#e63946" : "#6c757d";
    iconClass = "bi-exclamation-triangle-fill";
  }

  return L.divIcon({
    className: "custom-dumping-marker",
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 6px rgba(0,0,0,0.4); border: 2px solid white;
      transition: all 0.3s ease;
    ">
      <i class="bi ${iconClass}" style="color: white; font-size: 14px; transform: rotate(45deg);"></i>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Auto-fit map bounds component
function AutoFitBounds({ markers }: { markers: DumpingReport[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat || 6.9271, m.lng || 79.8612]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [markers, map]);
  return null;
}

function IllegalDumpingManagement() {
  const [incidents, setIncidents] = useState<DumpingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form State for New Report
  const [form, setForm] = useState({
    title: "",
    location: "",
    zone: "Colombo 07 - Cinnamon Gardens / Town Hall",
    severity: "Standard" as DumpingReport["severity"],
    assignedOfficer: "",
    photoUrl: "",
    lat: "6.9142",
    lng: "79.8610",
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

  // Handle Photo File Upload -> Convert to Base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // When Zone dropdown changes, auto-set lat/lng to exact CMC location
  const handleZoneChange = (zoneName: string) => {
    const loc = CMC_COLOMBO_ZONES[zoneName] || { lat: 6.9142, lng: 79.8610 };
    const offsetLat = (loc.lat + (Math.random() - 0.5) * 0.005).toFixed(4);
    const offsetLng = (loc.lng + (Math.random() - 0.5) * 0.005).toFixed(4);
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
      photo_url: form.photoUrl || undefined,
      lat: parseFloat(form.lat) || 6.9142,
      lng: parseFloat(form.lng) || 79.8610,
    });

    setIncidents((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      title: "",
      location: "",
      zone: "Colombo 07 - Cinnamon Gardens / Town Hall",
      severity: "Standard",
      assignedOfficer: "",
      photoUrl: "",
      lat: "6.9142",
      lng: "79.8610",
    });
  };

  const handleStatusChange = async (id: string, newStatus: DumpingReport["status"]) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    await updateDumpingStatus(id, newStatus);
  };

  const handleDeleteIncident = async (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from("dumping_reports").delete().eq("id", id);
    } catch (err) {
      console.error("Delete dumping report error:", err);
    }
  };

  const filtered = incidents.filter((i) => {
    const matchesSeverity = severityFilter ? i.severity === severityFilter : true;
    const matchesStatus = statusFilter ? i.status === statusFilter : true;
    return matchesSeverity && matchesStatus;
  });

  // CMC Town Hall Center
  const defaultCenterLat = 6.9142;
  const defaultCenterLng = 79.8610;

  const getDeconflictedCoordinates = (incident: DumpingReport, index: number): [number, number] => {
    let lat = incident.lat || defaultCenterLat;
    let lng = incident.lng || defaultCenterLng;

    const duplicates = incidents.filter(
      (other, idx) =>
        idx < index &&
        Math.abs((other.lat || defaultCenterLat) - lat) < 0.0001 &&
        Math.abs((other.lng || defaultCenterLng) - lng) < 0.0001
    );

    if (duplicates.length > 0) {
      const angle = duplicates.length * 2.1;
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
            Colombo Municipal Council (CMC) Hotspot & Citizen Evidence Monitoring.
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
              <span className="badge bg-success-subtle text-success-emphasis">
                CMC GPS Telemetry
              </span>
            </div>
            <div style={{ height: "540px", width: "100%" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                  <div className="spinner-border spinner-border-sm text-success me-2"></div>
                  Loading CMC hotspot map...
                </div>
              ) : (
                <MapContainer
                  center={[defaultCenterLat, defaultCenterLng]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <AutoFitBounds markers={filtered} />
                  {filtered.map((incident, idx) => {
                    const pos = getDeconflictedCoordinates(incident, idx);
                    return (
                      <Marker
                        key={incident.id}
                        position={pos}
                        icon={createPin(incident.severity, incident.status)}
                      >
                        <Popup>
                          <div style={{ maxWidth: "220px" }}>
                            <strong className="text-dark fs-6">{incident.title}</strong>
                            <br />
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {incident.location} ({incident.zone})
                            </small>

                            {/* Photo Evidence in Popup */}
                            {incident.photo_url ? (
                              <div className="my-2 text-center">
                                <img
                                  src={incident.photo_url}
                                  alt="Report Photo"
                                  className="img-fluid rounded border shadow-sm"
                                  style={{ maxHeight: "110px", cursor: "pointer", objectFit: "cover" }}
                                  onClick={() => setSelectedPhoto(incident.photo_url || null)}
                                />
                                <div className="small text-success mt-1 fw-semibold">
                                  <i className="bi bi-eye-fill me-1"></i>Click image to expand
                                </div>
                              </div>
                            ) : (
                              <div className="my-1 small text-muted fst-italic">
                                No photo attached by citizen
                              </div>
                            )}

                            <div className="mt-2 pt-2 border-top small">
                              <strong>Status:</strong>{" "}
                              <span
                                className={`badge bg-${
                                  incident.status === "Resolved"
                                    ? "success"
                                    : incident.status === "Assigned"
                                    ? "warning"
                                    : "danger"
                                }-subtle text-dark`}
                              >
                                {incident.status}
                              </span>
                            </div>
                          </div>
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
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>Citizen Reports Feed</span>
              <span className="badge bg-light text-muted fw-normal">{filtered.length} reports</span>
            </div>
            <div
              className="list-group list-group-flush overflow-y-auto"
              style={{ maxHeight: "540px" }}
            >
              {loading ? (
                <div className="p-4 text-center text-muted">Loading incidents...</div>
              ) : (
                filtered.map((incident) => {
                  const statusBgClass =
                    incident.status === "Resolved"
                      ? "bg-success-subtle text-success-emphasis border-success"
                      : incident.status === "Assigned"
                      ? "bg-warning-subtle text-warning-emphasis border-warning"
                      : "bg-danger-subtle text-danger-emphasis border-danger";

                  return (
                    <div key={incident.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0 text-dark">{incident.title}</h6>
                        <span
                          className={`badge bg-${severityBadge[incident.severity].bg}-subtle text-${severityBadge[incident.severity].bg}-emphasis`}
                        >
                          <i className={`bi ${severityBadge[incident.severity].icon} me-1`}></i>
                          {incident.severity}
                        </span>
                      </div>

                      <div className="small text-muted mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {incident.location} ({incident.zone})
                      </div>

                      {/* Photo Thumbnail in Feed */}
                      {incident.photo_url ? (
                        <div
                          className="d-flex align-items-center gap-2 p-2 mb-2 rounded bg-light border cursor-pointer"
                          onClick={() => setSelectedPhoto(incident.photo_url || null)}
                          title="Click to view photo evidence"
                        >
                          <img
                            src={incident.photo_url}
                            alt="Evidence Thumbnail"
                            className="rounded"
                            style={{ width: "42px", height: "42px", objectFit: "cover" }}
                          />
                          <div>
                            <div className="small fw-semibold text-dark">
                              <i className="bi bi-camera-fill text-primary me-1"></i>
                              Citizen Photo Attached
                            </div>
                            <div className="small text-primary" style={{ fontSize: "11px" }}>
                              Click to view evidence photo
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="small text-muted mb-2 fst-italic" style={{ fontSize: "12px" }}>
                          <i className="bi bi-camera-video-off me-1"></i>No photo evidence uploaded
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <select
                          className={`form-select form-select-sm border fw-semibold ${statusBgClass}`}
                          style={{ width: "130px" }}
                          value={incident.status}
                          onChange={(e) =>
                            handleStatusChange(incident.id, e.target.value as DumpingReport["status"])
                          }
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button
                          className="btn btn-sm btn-outline-danger border-0 p-1"
                          title="Delete incident"
                          onClick={() => handleDeleteIncident(incident.id)}
                        >
                          <i className="bi bi-trash fs-6"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
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
                      placeholder="e.g. Illegal Waste Dumped near Market"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Specific Location / Street Address
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
                        CMC Controlling District
                      </label>
                      <select
                        className="form-select"
                        value={form.zone}
                        onChange={(e) => handleZoneChange(e.target.value)}
                      >
                        {Object.keys(CMC_COLOMBO_ZONES).map((z) => (
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

                  {/* Citizen Photo Upload Field */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Upload Citizen Photo Evidence (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control mb-2"
                      onChange={handleFileChange}
                    />
                    {form.photoUrl && (
                      <div className="text-center p-2 border rounded bg-light">
                        <img
                          src={form.photoUrl}
                          alt="Uploaded Preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: "120px" }}
                        />
                        <div className="small text-success mt-1">Photo ready for submission!</div>
                      </div>
                    )}
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

      {/* Full-Size Photo Modal */}
      {selectedPhoto && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1060 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-white border-0 shadow-lg">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title fw-bold text-light">
                  <i className="bi bi-camera-fill me-2 text-success"></i>
                  Citizen Photo Evidence
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedPhoto(null)}
                ></button>
              </div>
              <div className="modal-body text-center p-3">
                <img
                  src={selectedPhoto}
                  alt="Full-size evidence"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "75vh", objectFit: "contain" }}
                />
              </div>
              <div className="modal-footer border-secondary py-2">
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IllegalDumpingManagement;