import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { PickupRequest, Truck, Collector } from "../../types/database.types";
import {
  getPickupRequests,
  addPickupRequest,
  updatePickupRequestStatus,
  deletePickupRequest,
  getTrucks,
  getCollectors,
  addSchedule,
  updateTruckSchedule,
} from "../../services/apiService";
import { CMC_COLOMBO_ZONES } from "../illegal-dumping/IllegalDumpingManagement";

const statusBadge: Record<PickupRequest["status"], { bg: string; icon: string }> = {
  Pending: { bg: "danger", icon: "bi-clock-history" },
  Dispatched: { bg: "warning", icon: "bi-truck" },
  Collected: { bg: "success", icon: "bi-check-circle-fill" },
};

function createHouseIcon(status: PickupRequest["status"]) {
  const color =
    status === "Collected"
      ? "#198754"
      : status === "Dispatched"
      ? "#fd7e14"
      : "#0d6efd";

  const iconClass =
    status === "Collected"
      ? "bi-check-circle-fill"
      : status === "Dispatched"
      ? "bi-truck"
      : "bi-house-fill";

  return L.divIcon({
    className: "custom-pickup-marker",
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${color};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 6px rgba(0,0,0,0.35); border: 2px solid white;
      transition: all 0.3s ease;
    ">
      <i class="bi ${iconClass}" style="color: white; font-size: 14px;"></i>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function AutoFitBounds({ markers }: { markers: PickupRequest[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat || 6.9142, m.lng || 79.8610]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [markers, map]);
  return null;
}

function PickupRequestsManagement() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dispatchZone, setDispatchZone] = useState("");

  // Form State for Citizen Request
  const [form, setForm] = useState({
    citizenName: "",
    citizenPhone: "",
    address: "",
    zone: "Colombo 07 - Cinnamon Gardens / Town Hall",
    wasteType: "Organic" as PickupRequest["waste_type"],
    lat: "6.9142",
    lng: "79.8610",
  });

  // Form State for Dispatching Truck
  const [dispatchForm, setDispatchForm] = useState({
    selectedTruck: "",
    selectedCollector: "",
    timeSlot: "06:00 AM - 10:00 AM",
  });

  const fetchData = async () => {
    setLoading(true);
    const [reqData, trkData, colData] = await Promise.all([
      getPickupRequests(),
      getTrucks(),
      getCollectors(),
    ]);
    setRequests(reqData);
    setTrucks(trkData);
    setCollectors(colData);

    if (trkData.length > 0) {
      setDispatchForm((prev) => ({
        ...prev,
        selectedTruck: `${trkData[0].plate} (${trkData[0].id})`,
      }));
    }
    if (colData.length > 0) {
      setDispatchForm((prev) => ({
        ...prev,
        selectedCollector: colData[0].name,
      }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAddCitizenRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.citizenName || !form.address) return;
    setSubmitting(true);

    const created = await addPickupRequest({
      citizen_name: form.citizenName,
      citizen_phone: form.citizenPhone,
      address: form.address,
      zone: form.zone,
      waste_type: form.wasteType,
      request_date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Pending",
      lat: parseFloat(form.lat) || 6.9142,
      lng: parseFloat(form.lng) || 79.8610,
    });

    setRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
    setShowSimulateModal(false);
    setSubmitting(false);
    setForm({
      citizenName: "",
      citizenPhone: "",
      address: "",
      zone: "Colombo 07 - Cinnamon Gardens / Town Hall",
      wasteType: "Organic",
      lat: "6.9142",
      lng: "79.8610",
    });
  };

  const handleStatusChange = async (id: string, newStatus: PickupRequest["status"]) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    await updatePickupRequestStatus(id, newStatus);
  };

  const handleDeleteRequest = async (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await deletePickupRequest(id);
  };

  // Open Dispatch Modal for a specific CMC Zone hotspot
  const openDispatchForZone = (zoneName: string) => {
    setDispatchZone(zoneName);
    setShowDispatchModal(true);
  };

  // Dispatch Truck to clear demand hotspot
  const handleDispatchTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.selectedTruck || !dispatchForm.selectedCollector) return;
    setSubmitting(true);

    // 1. Create a schedule entry for this CMC Zone
    await addSchedule({
      day: new Date().getDate(),
      route_code: `Demand Dispatch - ${dispatchZone.split(" - ")[0]}`,
      service_area: dispatchZone,
      date_str: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      time_slot: dispatchForm.timeSlot,
      vehicle: dispatchForm.selectedTruck,
      driver_team: dispatchForm.selectedCollector,
      waste_type: "Organic",
      status: "Scheduled",
    });

    // 2. Sync vehicle route & position to Supabase trucks table
    const loc = CMC_COLOMBO_ZONES[dispatchZone] || { lat: 6.9142, lng: 79.8610 };
    await updateTruckSchedule(
      dispatchForm.selectedTruck,
      dispatchZone,
      dispatchForm.selectedCollector,
      loc.lat,
      loc.lng
    );

    // 3. Mark all pending requests in this zone as "Dispatched"
    const pendingInZone = requests.filter(
      (r) => r.zone === dispatchZone && r.status === "Pending"
    );

    await Promise.all(
      pendingInZone.map((r) =>
        updatePickupRequestStatus(r.id, "Dispatched", dispatchForm.selectedTruck)
      )
    );

    setRequests((prev) =>
      prev.map((r) =>
        r.zone === dispatchZone && r.status === "Pending"
          ? { ...r, status: "Dispatched", assigned_truck: dispatchForm.selectedTruck }
          : r
      )
    );

    setShowDispatchModal(false);
    setSubmitting(false);
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.citizen_name.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.zone.toLowerCase().includes(search.toLowerCase()) ||
      r.citizen_phone.includes(search);
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    const matchesZone = zoneFilter ? r.zone === zoneFilter : true;
    return matchesSearch && matchesStatus && matchesZone;
  });

  // Calculate Demand Hotspots per CMC Zone
  const demandByZone = requests
    .filter((r) => r.status === "Pending")
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.zone] = (acc[r.zone] || 0) + 1;
      return acc;
    }, {});

  const defaultCenterLat = 6.9142;
  const defaultCenterLng = 79.8610;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Citizen Household Waste Pickup Requests
          </h2>
          <p className="text-muted mb-0">
            Monitor neighborhood waste pickup demand, aggregate road clusters, and dispatch collection trucks.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowSimulateModal(true)}
          >
            <i className="bi bi-plus-circle-fill"></i> Log Citizen Household Request
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">Total Requests</span>
                <div className="rounded p-2 bg-primary-subtle text-primary">
                  <i className="bi bi-house-check-fill"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold">{loading ? "..." : requests.length}</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">Pending Collection</span>
                <div className="rounded p-2 bg-danger-subtle text-danger">
                  <i className="bi bi-clock-history"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : requests.filter((r) => r.status === "Pending").length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">Truck Dispatched</span>
                <div className="rounded p-2 bg-warning-subtle text-warning">
                  <i className="bi bi-truck"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : requests.filter((r) => r.status === "Dispatched").length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small text-uppercase fw-semibold">Completed Pickup</span>
                <div className="rounded p-2 bg-success-subtle text-success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : requests.filter((r) => r.status === "Collected").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demand Hotspots Aggregation Alert */}
      {Object.keys(demandByZone).length > 0 && (
        <div className="card shadow-sm border-0 bg-warning-subtle mb-4">
          <div className="card-body py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill text-warning fs-4 me-1"></i>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">High Waste Demand Road Clusters Detected</h6>
                  <small className="text-dark">
                    Multiple household pickup requests waiting in Colombo Municipal districts.
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {Object.entries(demandByZone).map(([zone, count]) => (
                  <button
                    key={zone}
                    className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm"
                    onClick={() => openDispatchForZone(zone)}
                  >
                    <i className="bi bi-truck me-1"></i>
                    Dispatch Truck to {zone.split(" - ")[0]} ({count} Households)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map & List View */}
      <div className="row g-4 mb-4">
        {/* Demand Map */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span>Colombo Citizen Household Request Demand Map</span>
              <span className="badge bg-primary-subtle text-primary-emphasis">
                Real-time Request Clusters
              </span>
            </div>
            <div style={{ height: "480px", width: "100%" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                  <div className="spinner-border spinner-border-sm text-success me-2"></div>
                  Loading request map...
                </div>
              ) : (
                <MapContainer
                  center={[defaultCenterLat, defaultCenterLng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <AutoFitBounds markers={filtered} />
                  {filtered.map((req) => (
                    <Marker
                      key={req.id}
                      position={[req.lat || defaultCenterLat, req.lng || defaultCenterLng]}
                      icon={createHouseIcon(req.status)}
                    >
                      <Popup>
                        <strong className="text-dark fs-6">{req.citizen_name}</strong>
                        <br />
                        <small className="text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          {req.address} ({req.zone})
                        </small>
                        <br />
                        <strong>Waste Type:</strong> {req.waste_type}
                        <br />
                        <strong>Phone:</strong> {req.citizen_phone}
                        <br />
                        <strong>Status:</strong>{" "}
                        <span className={`badge bg-${statusBadge[req.status].bg}-subtle text-dark`}>
                          {req.status}
                        </span>
                        {req.assigned_truck && (
                          <div className="mt-1 small text-primary">
                            <i className="bi bi-truck me-1"></i>Truck: {req.assigned_truck}
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Demand Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3">Demand Summary by Zone</div>
            <div className="list-group list-group-flush overflow-y-auto" style={{ maxHeight: "480px" }}>
              {Object.keys(CMC_COLOMBO_ZONES).map((z) => {
                const zoneReqs = requests.filter((r) => r.zone === z);
                const pendingCount = zoneReqs.filter((r) => r.status === "Pending").length;
                if (zoneReqs.length === 0) return null;

                return (
                  <div key={z} className="list-group-item p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">{z.split(" - ")[0]}</span>
                      <span className="badge bg-danger">{pendingCount} Waiting</span>
                    </div>
                    <div className="small text-muted mb-2">{z}</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">{zoneReqs.length} total requests</span>
                      {pendingCount > 0 && (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2"
                          onClick={() => openDispatchForZone(z)}
                        >
                          Dispatch Truck
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="p-4 text-center text-muted">No pickup requests logged yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card shadow-sm border-0">
        {/* Table Filters */}
        <div className="card-header bg-white d-flex flex-wrap gap-3 justify-content-between align-items-center py-3">
          <div className="position-relative" style={{ minWidth: "260px", flex: 1 }}>
            <i
              className="bi bi-search position-absolute text-muted"
              style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
            ></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by citizen name, phone, address, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ minWidth: "170px" }}
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="">All CMC Zones</option>
            {Object.keys(CMC_COLOMBO_ZONES).map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ minWidth: "160px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Collected">Collected</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Citizen Name & Phone</th>
                <th>Address & CMC Zone</th>
                <th>Waste Type</th>
                <th>Request Date</th>
                <th>Assigned Truck</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching pickup requests...
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-bold text-dark">{r.citizen_name}</div>
                      <div className="small text-muted">{r.citizen_phone}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{r.address}</div>
                      <div className="small text-muted">{r.zone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{r.waste_type}</span>
                    </td>
                    <td className="small text-muted">{r.request_date}</td>
                    <td className="small fw-semibold text-primary">
                      {r.assigned_truck ? (
                        <>
                          <i className="bi bi-truck me-1"></i>
                          {r.assigned_truck}
                        </>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm border fw-semibold bg-${statusBadge[r.status].bg}-subtle text-dark`}
                        style={{ width: "130px" }}
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(r.id, e.target.value as PickupRequest["status"])
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Collected">Collected</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger border-0 p-1"
                        title="Delete request"
                        onClick={() => handleDeleteRequest(r.id)}
                      >
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No household pickup requests found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Simulate Citizen Household Request */}
      {showSimulateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Log Citizen Household Waste Request</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSimulateModal(false)}></button>
              </div>
              <form onSubmit={handleAddCitizenRequest}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Citizen Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Nimal Fernando"
                      value={form.citizenName}
                      onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 077 123 4567"
                        value={form.citizenPhone}
                        onChange={(e) => setForm({ ...form, citizenPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Waste Type
                      </label>
                      <select
                        className="form-select"
                        value={form.wasteType}
                        onChange={(e) =>
                          setForm({ ...form, wasteType: e.target.value as PickupRequest["waste_type"] })
                        }
                      >
                        <option value="Organic">Organic Waste</option>
                        <option value="Recyclables">Recyclables</option>
                        <option value="Hazardous">Hazardous</option>
                        <option value="Bulk Waste">Bulk / Furniture Waste</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      CMC Controlling Zone
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

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      House Address / Street Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. No. 45, Ward Place, Cinnamon Gardens"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowSimulateModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Saving..." : "Log Household Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Dispatch Truck to Demand Hotspot */}
      {showDispatchModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Dispatch Truck to {dispatchZone}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDispatchModal(false)}></button>
              </div>
              <form onSubmit={handleDispatchTruck}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 small mb-3">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Dispatching a truck will create a collection schedule entry and update vehicle GPS routes in real-time.
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Select Collection Vehicle <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select border-success fw-semibold"
                      value={dispatchForm.selectedTruck}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, selectedTruck: e.target.value })}
                      required
                    >
                      <option value="">-- Select Truck --</option>
                      {trucks.map((t) => (
                        <option key={t.id} value={`${t.plate} (${t.id})`}>
                          {t.plate} - {t.type} ({t.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Select Assigned Collector <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select border-success fw-semibold"
                      value={dispatchForm.selectedCollector}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, selectedCollector: e.target.value })}
                      required
                    >
                      <option value="">-- Select Collector --</option>
                      {collectors.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Collection Time Slot
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={dispatchForm.timeSlot}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, timeSlot: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowDispatchModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-sm px-3"
                    disabled={submitting || trucks.length === 0 || collectors.length === 0}
                  >
                    {submitting ? "Dispatching..." : "Dispatch Truck Now"}
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

export default PickupRequestsManagement;
