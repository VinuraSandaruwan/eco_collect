import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { DumpingReport } from "../../types/database.types";
import { getDumpingReports, addDumpingReport, updateDumpingStatus } from "../../services/apiService";
import { supabase } from "../../services/supabaseClient";

// Comprehensive Nationwide Sri Lanka Municipalities & Locations
export const SRI_LANKA_LOCATIONS: Record<string, { province: string; lat: number; lng: number }> = {
  // Western Province - Colombo
  "Colombo 01 - Fort": { province: "Western", lat: 6.9344, lng: 79.8428 },
  "Colombo 02 - Slave Island": { province: "Western", lat: 6.9218, lng: 79.8562 },
  "Colombo 03 - Kollupitiya": { province: "Western", lat: 6.9083, lng: 79.8508 },
  "Colombo 04 - Bambalapitiya": { province: "Western", lat: 6.8920, lng: 79.8560 },
  "Colombo 05 - Havelock Town": { province: "Western", lat: 6.8833, lng: 79.8735 },
  "Colombo 06 - Wellawatte": { province: "Western", lat: 6.8743, lng: 79.8610 },
  "Colombo 07 - Town Hall / Cinnamon Gardens": { province: "Western", lat: 6.9142, lng: 79.8610 },
  "Colombo Municipal Council (Head Office)": { province: "Western", lat: 6.9142, lng: 79.8610 },
  "Colombo 08 - Borella": { province: "Western", lat: 6.9147, lng: 79.8778 },
  "Colombo 09 - Dematagoda": { province: "Western", lat: 6.9298, lng: 79.8789 },
  "Colombo 10 - Maradana": { province: "Western", lat: 6.9261, lng: 79.8654 },
  "Colombo 13 - Kochchikade (Colombo)": { province: "Western", lat: 6.9480, lng: 79.8560 },
  "Colombo 14 - Grandpass": { province: "Western", lat: 6.9530, lng: 79.8700 },
  "Colombo 15 - Mattakkuliya": { province: "Western", lat: 6.9720, lng: 79.8680 },
  "Dehiwala - Mount Lavinia": { province: "Western", lat: 6.8480, lng: 79.8650 },
  "Sri Jayawardenepura Kotte": { province: "Western", lat: 6.8885, lng: 79.9177 },
  "Moratuwa": { province: "Western", lat: 6.7730, lng: 79.8816 },

  // Western Province - Gampaha & Negombo
  "Negombo North": { province: "Western", lat: 7.2090, lng: 79.8360 },
  "Negombo South": { province: "Western", lat: 7.1700, lng: 79.8520 },
  "Kochchikade (Negombo)": { province: "Western", lat: 7.2270, lng: 79.8210 },
  "Katunayake": { province: "Western", lat: 7.1700, lng: 79.8900 },
  "Kandana": { province: "Western", lat: 7.0489, lng: 79.8942 },
  "Ja-Ela": { province: "Western", lat: 7.0750, lng: 79.8920 },
  "Wattala": { province: "Western", lat: 6.9890, lng: 79.8920 },
  "Gampaha Town": { province: "Western", lat: 7.0840, lng: 79.9930 },

  // Central Province
  "Kandy City Center": { province: "Central", lat: 7.2906, lng: 80.6337 },
  "Peradeniya": { province: "Central", lat: 7.2680, lng: 80.5970 },
  "Matale Town": { province: "Central", lat: 7.4675, lng: 80.6234 },
  "Nuwara Eliya": { province: "Central", lat: 6.9497, lng: 80.7891 },

  // Southern Province
  "Galle Fort & City": { province: "Southern", lat: 6.0535, lng: 80.2210 },
  "Matara Town": { province: "Southern", lat: 5.9549, lng: 80.5550 },
  "Hambantota": { province: "Southern", lat: 6.1241, lng: 81.1185 },

  // Northern & Eastern Provinces
  "Jaffna Town": { province: "Northern", lat: 9.6615, lng: 80.0255 },
  "Vavuniya": { province: "Northern", lat: 8.7514, lng: 80.4971 },
  "Trincomalee": { province: "Eastern", lat: 8.5874, lng: 81.2152 },
  "Batticaloa": { province: "Eastern", lat: 7.7170, lng: 81.7000 },

  // Other Provinces
  "Kurunegala Town": { province: "North Western", lat: 7.4863, lng: 80.3647 },
  "Anuradhapura": { province: "North Central", lat: 8.3114, lng: 80.4037 },
  "Badulla": { province: "Uva", lat: 6.9934, lng: 81.0550 },
  "Ratnapura": { province: "Sabaragamuwa", lat: 6.6828, lng: 80.3992 },
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
    color = "#fd7e14"; // Orange / Amber for Assigned
    iconClass = "bi-person-check-fill";
  } else {
    // Unassigned
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

// Auto-fit map bounds component to encompass all markers across Sri Lanka
function AutoFitBounds({ markers }: { markers: DumpingReport[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat || 7.0, m.lng || 79.9]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
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

  // Form State for New Report
  const [form, setForm] = useState({
    title: "",
    location: "",
    zone: "Colombo 07 - Cinnamon Gardens",
    severity: "Standard" as DumpingReport["severity"],
    assignedOfficer: "",
    lat: "6.9067",
    lng: "79.8708",
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

  // When Zone dropdown changes, auto-set lat/lng to exact location
  const handleZoneChange = (zoneName: string) => {
    const loc = SRI_LANKA_LOCATIONS[zoneName] || { lat: 6.9271, lng: 79.8612 };
    // Add small random offset so multiple items in same city don't stack directly on top
    const offsetLat = (loc.lat + (Math.random() - 0.5) * 0.006).toFixed(4);
    const offsetLng = (loc.lng + (Math.random() - 0.5) * 0.006).toFixed(4);
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
      lat: parseFloat(form.lat) || 6.9067,
      lng: parseFloat(form.lng) || 79.8708,
    });

    setIncidents((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      title: "",
      location: "",
      zone: "Colombo 07 - Cinnamon Gardens",
      severity: "Standard",
      assignedOfficer: "",
      lat: "6.9067",
      lng: "79.8708",
    });
  };

  const handleStatusChange = async (id: string, newStatus: DumpingReport["status"]) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    await updateDumpingStatus(id, newStatus);
  };

  // Delete incident report helper
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

  // Default Center for Sri Lanka Overview
  const defaultCenterLat = 7.15;
  const defaultCenterLng = 79.95;

  // Helper to ensure overlapping pins get spread out visually so ALL pins are distinct
  const getDeconflictedCoordinates = (incident: DumpingReport, index: number): [number, number] => {
    let lat = incident.lat || defaultCenterLat;
    let lng = incident.lng || defaultCenterLng;

    // Check if another report has the exact same lat/lng
    const duplicates = incidents.filter(
      (other, idx) =>
        idx < index &&
        Math.abs((other.lat || defaultCenterLat) - lat) < 0.0001 &&
        Math.abs((other.lng || defaultCenterLng) - lng) < 0.0001
    );

    if (duplicates.length > 0) {
      // Offset position in a spiral ring around the coordinate
      const angle = duplicates.length * 2.1;
      const radius = 0.004 * Math.sqrt(duplicates.length);
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
            Nationwide Sri Lanka Waste Hotspot Monitoring & Incident Management.
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
              <span>Sri Lanka Hotspot GPS Map</span>
              <span className="badge bg-success-subtle text-success-emphasis">
                Nationwide Telemetry
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
                  center={[defaultCenterLat, defaultCenterLng]}
                  zoom={9}
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
                          <strong className="text-danger">{incident.title}</strong>
                          <br />
                          <strong>Location:</strong> {incident.location} ({incident.zone})
                          <br />
                          <strong>Severity:</strong> {incident.severity}
                          <br />
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
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>Incident Feed</span>
              <span className="badge bg-light text-muted fw-normal">{filtered.length} total</span>
            </div>
            <div
              className="list-group list-group-flush overflow-y-auto"
              style={{ maxHeight: "520px" }}
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
                          <i className="bi bi-trash"></i>
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
                      placeholder="e.g. Illegal Dumping near Market / Roadside"
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
                        Sri Lanka City / Zone
                      </label>
                      <select
                        className="form-select"
                        value={form.zone}
                        onChange={(e) => handleZoneChange(e.target.value)}
                      >
                        {Object.entries(SRI_LANKA_LOCATIONS).map(([z, info]) => (
                          <option key={z} value={z}>
                            {z} ({info.province} Prov.)
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