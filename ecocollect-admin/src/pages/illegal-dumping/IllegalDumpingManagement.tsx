import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface DumpingIncident {
  id: string;
  title: string;
  location: string;
  zone: string;
  severity: "Urgent" | "Standard" | "Low";
  status: "Unassigned" | "Assigned" | "Resolved";
  reportedAgo: string;
  assignedOfficer?: string;
  lat: number;
  lng: number;
}

const initialIncidents: DumpingIncident[] = [
  {
    id: "DMP-201",
    title: "Suburban Alleyway Furniture",
    location: "402 West End District, Unit B",
    zone: "Negombo North",
    severity: "Urgent",
    status: "Unassigned",
    reportedAgo: "2 hours ago",
    lat: 7.2095,
    lng: 79.8385,
  },
  {
    id: "DMP-202",
    title: "Industrial Tire Stack",
    location: "Northside Park Perimeter",
    zone: "Negombo South",
    severity: "Standard",
    status: "Assigned",
    reportedAgo: "5 hours ago",
    assignedOfficer: "Officer Davis",
    lat: 7.1935,
    lng: 79.8465,
  },
  {
    id: "DMP-203",
    title: "Construction Debris Lot",
    location: "880 Downtown Industrial Blvd",
    zone: "Kochchikade",
    severity: "Urgent",
    status: "Unassigned",
    reportedAgo: "1 day ago",
    lat: 7.2250,
    lng: 79.8590,
  },
  {
    id: "DMP-204",
    title: "Canal Bank Waste Pile",
    location: "Near Beach Road Bridge",
    zone: "Negombo South",
    severity: "Low",
    status: "Resolved",
    reportedAgo: "3 days ago",
    assignedOfficer: "Officer Perera",
    lat: 7.1890,
    lng: 79.8510,
  },
];

const severityBadge: Record<DumpingIncident["severity"], { bg: string; icon: string }> = {
  Urgent: { bg: "danger", icon: "bi-exclamation-circle-fill" },
  Standard: { bg: "secondary", icon: "bi-info-circle-fill" },
  Low: { bg: "success", icon: "bi-check-circle-fill" },
};

function createPin(severity: DumpingIncident["severity"]) {
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
  const [incidents] = useState<DumpingIncident[]>(initialIncidents);
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
          <h2 className="fw-bold mb-1">Illegal Dumping Management</h2>
          <p className="text-muted mb-0">
            Monitor, assign, and resolve unauthorized waste disposal hotspots.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-download"></i>
            Export Data
          </button>
          <button className="btn btn-success d-flex align-items-center gap-2">
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
              <div className="fs-3 fw-bold">{incidents.filter((i) => i.status !== "Resolved").length}</div>
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
              <div className="text-muted small mb-1">New Reports (This Week)</div>
              <div className="fs-3 fw-bold">{incidents.length}</div>
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
              <div className="text-muted small mb-1">Resolved Incidents</div>
              <div className="fs-3 fw-bold">{incidents.filter((i) => i.status === "Resolved").length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div
                className="d-flex align-items-center justify-content-center rounded mb-2"
                style={{ width: "44px", height: "44px", backgroundColor: "rgba(108,117,125,0.1)" }}
              >
                <i className="bi bi-geo-alt-fill text-secondary"></i>
              </div>
              <div className="text-muted small mb-1">High Priority Zone</div>
              <div className="fs-6 fw-bold mt-1">Negombo North</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Map */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 fw-bold">
            <i className="bi bi-geo-alt text-success"></i>
            Live Hotspot Map
          </div>
          <div className="d-flex gap-3 small text-muted">
            <span><span className="d-inline-block rounded-circle bg-danger" style={{ width: "10px", height: "10px" }}></span> Urgent</span>
            <span><span className="d-inline-block rounded-circle bg-success" style={{ width: "10px", height: "10px" }}></span> Resolved</span>
          </div>
        </div>
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer center={[centerLat, centerLng]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidents.map((incident) => (
              <Marker key={incident.id} position={[incident.lat, incident.lng]} icon={createPin(incident.severity)}>
                <Popup>
                  <strong>{incident.title}</strong>
                  <br />
                  {incident.location}
                  <br />
                  Severity: {incident.severity}
                  <br />
                  Status: {incident.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Incident Cards */}
      <h5 className="fw-bold mb-3">
        <i className="bi bi-grid-3x3-gap me-2 text-success"></i>
        Recent Incidents
      </h5>
      <div className="row g-4">
        {filtered.map((incident) => (
          <div className="col-md-6 col-lg-4" key={incident.id}>
            <div className="card shadow-sm border-0 h-100">
              <div
                className="d-flex align-items-center justify-content-center bg-light position-relative"
                style={{ height: "160px" }}
              >
                <i className="bi bi-trash3 text-secondary" style={{ fontSize: "48px" }}></i>
                <span
                  className={`badge bg-${severityBadge[incident.severity].bg} position-absolute top-0 start-0 m-2 d-flex align-items-center gap-1`}
                >
                  <i className={`bi ${severityBadge[incident.severity].icon}`}></i>
                  {incident.severity}
                </span>
                <span className="badge bg-dark bg-opacity-75 position-absolute bottom-0 end-0 m-2">
                  <i className="bi bi-clock me-1"></i>
                  {incident.reportedAgo}
                </span>
              </div>
              <div className="card-body d-flex flex-column">
                <h6 className="fw-bold mb-1">{incident.title}</h6>
                <p className="small text-muted mb-3">
                  <i className="bi bi-geo-alt me-1"></i>
                  {incident.location}
                </p>
                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  {incident.assignedOfficer ? (
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <i className="bi bi-person-check-fill text-success"></i>
                      {incident.assignedOfficer}
                    </span>
                  ) : (
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <i className="bi bi-person-x"></i>
                      Unassigned
                    </span>
                  )}
                  <button className="btn btn-sm btn-outline-success">
                    {incident.status === "Resolved" ? "View Details" : "Assign Officer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12">
            <div className="text-center text-muted py-5">
              No incidents match your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IllegalDumpingManagement;