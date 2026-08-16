import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Truck } from "../../types/database.types";
import { getTrucks, addTruck, updateTruckStatus, deleteTruck } from "../../services/apiService";

// ─── Pre-defined route GPS waypoints (Colombo Municipal Council, Sri Lanka) ───
const ROUTE_PATHS: Record<string, { color: string; label: string; coords: [number, number][] }> = {
  "Route CMC-1 - Colombo North (Fort & Kotahena)": {
    color: "#198754",
    label: "Route CMC-1 – Colombo North",
    coords: [
      [6.9720, 79.8680], // Mattakkuliya
      [6.9530, 79.8700], // Grandpass
      [6.9450, 79.8580], // Kotahena
      [6.9344, 79.8428], // Fort
    ],
  },
  "Route CMC-2 - Colombo Central (Maradana & Borella)": {
    color: "#0d6efd",
    label: "Route CMC-2 – Colombo Central",
    coords: [
      [6.9380, 79.8520], // Pettah
      [6.9261, 79.8654], // Maradana
      [6.9298, 79.8789], // Dematagoda
      [6.9147, 79.8778], // Borella
    ],
  },
  "Route CMC-3 - Colombo South (Kollupitiya & Wellawatte)": {
    color: "#fd7e14",
    label: "Route CMC-3 – Colombo South",
    coords: [
      [6.9218, 79.8562], // Slave Island
      [6.9083, 79.8508], // Kollupitiya
      [6.8920, 79.8560], // Bambalapitiya
      [6.8743, 79.8610], // Wellawatte
    ],
  },
  "Route CMC-4 - Colombo East (Cinnamon Gardens & Havelock)": {
    color: "#dc3545",
    label: "Route CMC-4 – Colombo East",
    coords: [
      [6.9147, 79.8778], // Borella
      [6.9067, 79.8708], // Cinnamon Gardens
      [6.8833, 79.8735], // Havelock Town
      [6.8743, 79.8610], // Kirulapone
    ],
  },
};

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

// ─── Fetch real road-following route from OSRM public API (free, no key) ─────
async function fetchRoadRoute(
  waypoints: [number, number][]
): Promise<[number, number][]> {
  try {
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM fetch failed");
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      // OSRM returns [lng, lat] — flip to [lat, lng] for Leaflet
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
    }
  } catch (e) {
    console.warn("OSRM road route fetch failed, falling back to straight lines", e);
  }
  return waypoints; // fallback to straight lines if API is unavailable
}

function FleetManagement() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "table">("map");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Real road-following route coordinates fetched from OSRM
  const [roadRoutes, setRoadRoutes] = useState<
    Record<string, [number, number][]>
  >({});

  // Form State for Adding New Vehicle
  const [form, setForm] = useState({
    plate: "",
    type: "Compactor Truck" as Truck["type"],
    capacity: "8.5 Tons",
    driver: "Unassigned",
    route: "Route CMC-1 - Colombo North (Fort & Kotahena)",
    fuelLevel: "100%",
    status: "Idle" as Truck["status"],
  });

  const centerLat = 6.9271;
  const centerLng = 79.8612;

  const fetchTrucks = async () => {
    setLoading(true);
    const data = await getTrucks();
    setTrucks(data);
    setLoading(false);
  };

  // Fetch real road routes from OSRM on mount
  useEffect(() => {
    fetchTrucks();

    async function loadRoadRoutes() {
      const results: Record<string, [number, number][]> = {};
      await Promise.all(
        Object.entries(ROUTE_PATHS).map(async ([key, route]) => {
          results[key] = await fetchRoadRoute(route.coords);
        })
      );
      setRoadRoutes(results);
    }
    loadRoadRoutes();
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

                    {/* ── Draw real road-following route polylines from OSRM ── */}
                    {Object.entries(ROUTE_PATHS).map(([routeKey, route]) => {
                      // Use OSRM road coords if loaded, else fall back to waypoints
                      const coords = roadRoutes[routeKey] ?? route.coords;
                      return (
                        <Polyline
                          key={routeKey}
                          positions={coords}
                          pathOptions={{
                            color: route.color,
                            weight: 5,
                            opacity: 0.9,
                          }}
                        >
                          <Tooltip sticky>{route.label}</Tooltip>
                        </Polyline>
                      );
                    })}

                    {/* ── Draw truck markers ── */}
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
                          <strong>Route:</strong>{" "}
                          <span
                            style={{
                              color: ROUTE_PATHS[truck.route ?? ""]?.color ?? "#333",
                              fontWeight: 600,
                            }}
                          >
                            {truck.route}
                          </span>
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
            <div className="card shadow-sm border-0 h-100 d-flex flex-column">

              {/* Active Vehicle List */}
              <div className="card-header bg-white fw-semibold py-2 border-bottom small text-muted text-uppercase">
                Active Vehicle List
              </div>
              <div className="list-group list-group-flush overflow-y-auto flex-grow-1" style={{ maxHeight: "380px" }}>
                {loading ? (
                  <div className="p-4 text-center text-muted">Loading fleet list...</div>
                ) : (
                  trucks.map((truck) => {
                    const routeMeta = ROUTE_PATHS[truck.route ?? ""];
                    return (
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
                        <div className="small mt-1 d-flex align-items-center gap-1">
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: routeMeta?.color ?? "#adb5bd",
                              flexShrink: 0,
                            }}
                          ></div>
                          <span style={{ color: routeMeta?.color ?? "#6c757d", fontWeight: 600, fontSize: "12px" }}>
                            {truck.route ?? "No Route Assigned"}
                          </span>
                        </div>
                      </div>
                    );
                  })
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
                      <option value="Route CMC-1 - Colombo North (Fort & Kotahena)">
                        Route CMC-1 - Colombo North (Fort & Kotahena)
                      </option>
                      <option value="Route CMC-2 - Colombo Central (Maradana & Borella)">
                        Route CMC-2 - Colombo Central (Maradana & Borella)
                      </option>
                      <option value="Route CMC-3 - Colombo South (Kollupitiya & Wellawatte)">
                        Route CMC-3 - Colombo South (Kollupitiya & Wellawatte)
                      </option>
                      <option value="Route CMC-4 - Colombo East (Cinnamon Gardens & Havelock)">
                        Route CMC-4 - Colombo East (Cinnamon Gardens & Havelock)
                      </option>
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