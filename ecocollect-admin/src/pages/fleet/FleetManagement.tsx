import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Truck } from "../../types/database.types";
import { getTrucks, addTruck, updateTruckStatus, deleteTruck } from "../../services/apiService";

function createTruckIcon(status: Truck["status"]) {
  const color =
    status === "On Route" ? "#198754" : status === "Idle" ? "#6c757d" : "#dc3545";

  return L.divIcon({
    className: "custom-truck-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <i class="bi bi-truck" style="color: white; font-size: 16px;"></i>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

const statusColor: Record<Truck["status"], string> = {
  "On Route": "success",
  Idle: "secondary",
  Maintenance: "danger",
};

function FleetManagement() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "table">("map");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Adding New Vehicle
  const [form, setForm] = useState({
    plate: "",
    type: "Compactor Truck" as Truck["type"],
    capacity: "8.5 Tons",
    driver: "Unassigned",
    route: "Route A - Negombo North",
    fuelLevel: "100%",
    status: "Idle" as Truck["status"],
  });

  const centerLat = 7.15;
  const centerLng = 79.87;

  const fetchTrucks = async () => {
    setLoading(true);
    const data = await getTrucks();
    setTrucks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate) return;
    setSubmitting(true);

    const created = await addTruck({
      plate: form.plate,
      type: form.type,
      capacity: form.capacity,
      driver: form.driver,
      route: form.route,
      status: form.status,
      fuel_level: form.fuelLevel,
      last_service: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      lat: 7.18 + (Math.random() - 0.5) * 0.05,
      lng: 79.85 + (Math.random() - 0.5) * 0.05,
    });

    setTrucks((prev) => [...prev.filter((t) => t.id !== created.id), created]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      plate: "",
      type: "Compactor Truck",
      capacity: "8.5 Tons",
      driver: "Unassigned",
      route: "Route A - Negombo North",
      fuelLevel: "100%",
      status: "Idle",
    });
  };

  const handleDeleteVehicle = async (id: string) => {
    setTrucks((prev) => prev.filter((t) => t.id !== id));
    await deleteTruck(id);
  };

  const handleStatusChange = async (id: string, newStatus: Truck["status"]) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await updateTruckStatus(id, newStatus);
  };

  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.plate.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.driver && t.driver.toLowerCase().includes(search.toLowerCase())) ||
      (t.route && t.route.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Vehicles & Fleet Management
          </h2>
          <p className="text-muted mb-0">
            Monitor real-time GPS locations, manage vehicle inventory, and assign drivers.
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* View Toggle */}
          <div className="btn-group shadow-sm">
            <button
              className={`btn btn-sm ${
                activeTab === "map" ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setActiveTab("map")}
            >
              <i className="bi bi-geo-alt me-1"></i> Live Map View
            </button>
            <button
              className={`btn btn-sm ${
                activeTab === "table" ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setActiveTab("table")}
            >
              <i className="bi bi-truck me-1"></i> Vehicle Inventory Table
            </button>
          </div>

          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i> Add Vehicle
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Fleet</div>
              <div className="fs-3 fw-bold">{loading ? "..." : `${trucks.length} Vehicles`}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">On Route</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : trucks.filter((t) => t.status === "On Route").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Standby / Idle</div>
              <div className="fs-3 fw-bold text-secondary">
                {loading ? "..." : trucks.filter((t) => t.status === "Idle").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Maintenance</div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : trucks.filter((t) => t.status === "Maintenance").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: LIVE MAP TRACKING ================= */}
      {activeTab === "map" && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
                <span>Real-Time GPS Vehicle Telemetry</span>
                <span className="badge bg-success-subtle text-success-emphasis">
                  Auto-sync active (30s)
                </span>
              </div>
              <div style={{ height: "520px", width: "100%" }}>
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Loading telemetry map...
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
                    {trucks.map((truck) => (
                      <Marker
                        key={truck.id}
                        position={[truck.lat, truck.lng]}
                        icon={createTruckIcon(truck.status)}
                      >
                        <Popup>
                          <strong>{truck.id}</strong> — {truck.plate}
                          <br />
                          <strong>Type:</strong> {truck.type}
                          <br />
                          <strong>Driver:</strong> {truck.driver}
                          <br />
                          <strong>Route:</strong> {truck.route}
                          <br />
                          <strong>Status:</strong> {truck.status}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold py-3">Active Vehicle List</div>
              <div className="list-group list-group-flush overflow-y-auto" style={{ maxHeight: "520px" }}>
                {loading ? (
                  <div className="p-4 text-center text-muted">Loading fleet list...</div>
                ) : (
                  trucks.map((truck) => (
                    <div key={truck.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark">{truck.id}</span>
                        <span className={`badge bg-${statusColor[truck.status] || "secondary"}-subtle text-${statusColor[truck.status] || "secondary"}-emphasis`}>
                          {truck.status}
                        </span>
                      </div>
                      <div className="fw-semibold text-dark small">{truck.plate}</div>
                      <div className="small text-muted">{truck.type} • {truck.capacity}</div>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-person me-1"></i>Driver: {truck.driver}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-geo-alt me-1"></i>{truck.route}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: VEHICLE MANAGEMENT TABLE ================= */}
      {activeTab === "table" && (
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
                placeholder="Search by license plate, ID, driver, or route..."
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
              <option value="On Route">On Route</option>
              <option value="Idle">Idle</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Vehicle ID</th>
                  <th>Plate Number</th>
                  <th>Type & Capacity</th>
                  <th>Assigned Driver</th>
                  <th>Default Route</th>
                  <th>Fuel Level</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">
                      <div className="spinner-border spinner-border-sm text-success me-2"></div>
                      Fetching fleet vehicles...
                    </td>
                  </tr>
                ) : (
                  filteredTrucks.map((truck) => (
                    <tr key={truck.id}>
                      <td>
                        <span className="fw-bold text-dark">{truck.id}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{truck.plate}</span>
                      </td>
                      <td>
                        <div className="small fw-semibold">{truck.type}</div>
                        <div className="small text-muted">{truck.capacity}</div>
                      </td>
                      <td className="small text-dark fw-medium">{truck.driver}</td>
                      <td className="small text-muted">{truck.route}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px", width: "60px" }}>
                            <div
                              className={`progress-bar bg-${
                                parseInt(truck.fuel_level || "0") > 50 ? "success" : parseInt(truck.fuel_level || "0") > 20 ? "warning" : "danger"
                              }`}
                              style={{ width: truck.fuel_level || "50%" }}
                            ></div>
                          </div>
                          <span className="small text-muted">{truck.fuel_level}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm border-0 bg-${statusColor[truck.status] || "secondary"}-subtle text-${statusColor[truck.status] || "secondary"}-emphasis fw-semibold`}
                          style={{ width: "130px" }}
                          value={truck.status}
                          onChange={(e) => handleStatusChange(truck.id, e.target.value as Truck["status"])}
                        >
                          <option value="On Route">On Route</option>
                          <option value="Idle">Idle</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light text-danger"
                          title="Delete Vehicle"
                          onClick={() => handleDeleteVehicle(truck.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredTrucks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No vehicles found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <span className="small text-muted">
              Showing {filteredTrucks.length} of {trucks.length} vehicles
            </span>
          </div>
        </div>
      )}

      {/* ================= ADD VEHICLE MODAL ================= */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Register New Fleet Vehicle</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddVehicle}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      License Plate Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. WP CAG-8890"
                      value={form.plate}
                      onChange={(e) => setForm({ ...form, plate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Vehicle Type
                      </label>
                      <select
                        className="form-select"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as Truck["type"] })}
                      >
                        <option value="Compactor Truck">Compactor Truck</option>
                        <option value="Tipper Truck">Tipper Truck</option>
                        <option value="Mini Collector">Mini Collector</option>
                        <option value="Hazardous Container">Hazardous Container</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Payload Capacity
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 8.5 Tons"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assign Driver
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. S. Perera / Unassigned"
                        value={form.driver}
                        onChange={(e) => setForm({ ...form, driver: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Initial Status
                      </label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as Truck["status"] })}
                      >
                        <option value="Idle">Idle (Depot)</option>
                        <option value="On Route">On Route</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Assigned Collection Route
                    </label>
                    <select
                      className="form-select"
                      value={form.route}
                      onChange={(e) => setForm({ ...form, route: e.target.value })}
                    >
                      <option value="Route A - Negombo North">Route A - Negombo North</option>
                      <option value="Route B - Negombo South">Route B - Negombo South</option>
                      <option value="Route C - Kochchikade">Route C - Kochchikade</option>
                      <option value="Route D - Kandana">Route D - Kandana</option>
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
                    {submitting ? "Registering..." : "Register Vehicle"}
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

export default FleetManagement;