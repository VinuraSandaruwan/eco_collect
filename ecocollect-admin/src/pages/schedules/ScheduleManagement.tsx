import React, { useState, useEffect } from "react";
import type { ScheduleItem, Collector, Truck } from "../../types/database.types";
import { getSchedules, addSchedule, updateScheduleStatus, getCollectors, getTrucks } from "../../services/apiService";

const COLOMBO_SERVICE_AREAS = [
  "Colombo 01 - Fort / Pettah",
  "Colombo 02 - Slave Island / Union Place",
  "Colombo 03 - Kollupitiya",
  "Colombo 04 - Bambalapitiya",
  "Colombo 05 - Havelock Town / Kirulapone",
  "Colombo 06 - Wellawatte",
  "Colombo 07 - Cinnamon Gardens",
  "Colombo 08 - Borella",
  "Colombo 09 - Dematagoda",
  "Colombo 10 - Maradana",
  "Colombo 13 - Kochchikade",
  "Colombo 14 - Grandpass",
  "Colombo 15 - Mattakkuliya",
];

const wasteTypeColor: Record<ScheduleItem["waste_type"], string> = {
  Organic: "success",
  Recyclables: "primary",
  Hazardous: "danger",
  General: "secondary",
};

const statusColor: Record<ScheduleItem["status"], string> = {
  Scheduled: "primary",
  "In Progress": "warning",
  Completed: "success",
  Delayed: "danger",
};

function ScheduleManagement() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wasteFilter, setWasteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    routeCode: "Route CMC-01",
    serviceArea: "Colombo 07 - Cinnamon Gardens",
    dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    day: new Date().getDate(),
    timeSlot: "06:00 AM - 10:00 AM",
    vehicle: "",
    driverTeam: "",
    wasteType: "Organic" as ScheduleItem["waste_type"],
    status: "Scheduled" as ScheduleItem["status"],
  });

  const fetchData = async () => {
    setLoading(true);
    const [schedData, colData, trkData] = await Promise.all([
      getSchedules(),
      getCollectors(),
      getTrucks(),
    ]);
    setSchedules(schedData);
    setCollectors(colData);
    setTrucks(trkData);

    // Pre-select first available driver & vehicle if available
    const initialDriver = colData.length > 0 ? colData[0].name : "";
    const initialVehicle = trkData.length > 0 ? `${trkData[0].plate} (${trkData[0].id})` : "";
    setForm((prev) => ({
      ...prev,
      driverTeam: initialDriver,
      vehicle: initialVehicle,
    }));

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // STRICT VALIDATION: Driver MUST be assigned
    if (!form.driverTeam || form.driverTeam.trim() === "" || form.driverTeam === "Unassigned") {
      setValidationError("Cannot create schedule! An assigned Driver is mandatory for route dispatch.");
      return;
    }

    if (!form.routeCode || !form.serviceArea || !form.vehicle) {
      setValidationError("Please fill out all required schedule fields.");
      return;
    }

    setSubmitting(true);

    const created = await addSchedule({
      day: form.day,
      route_code: form.routeCode,
      service_area: form.serviceArea,
      date_str: form.dateStr,
      time_slot: form.timeSlot,
      vehicle: form.vehicle,
      driver_team: form.driverTeam,
      waste_type: form.wasteType,
      status: form.status,
    });

    setSchedules((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
  };

  const handleStatusChange = async (id: string, newStatus: ScheduleItem["status"]) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    await updateScheduleStatus(id, newStatus);
  };

  const filtered = schedules.filter((s) => {
    const matchesSearch =
      s.route_code.toLowerCase().includes(search.toLowerCase()) ||
      s.service_area.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      s.driver_team.toLowerCase().includes(search.toLowerCase());
    const matchesWaste = wasteFilter ? s.waste_type === wasteFilter : true;
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesWaste && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Collection Schedules
          </h2>
          <p className="text-muted mb-0">
            Colombo Municipal Council daily dispatch & collection route scheduling.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => {
            setValidationError(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-calendar-plus"></i>
          Create Route Schedule
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Scheduled Runs</div>
              <div className="fs-3 fw-bold">{loading ? "..." : schedules.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">In Progress</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : schedules.filter((s) => s.status === "In Progress").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Completed Today</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : schedules.filter((s) => s.status === "Completed").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Delayed</div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : schedules.filter((s) => s.status === "Delayed").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
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
              placeholder="Search by route, service area, driver, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "160px" }}
            value={wasteFilter}
            onChange={(e) => setWasteFilter(e.target.value)}
          >
            <option value="">All Waste Types</option>
            <option value="Organic">Organic</option>
            <option value="Recyclables">Recyclables</option>
            <option value="Hazardous">Hazardous</option>
            <option value="General">General</option>
          </select>
          <select
            className="form-select"
            style={{ minWidth: "160px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Route Code & Area</th>
                <th>Date & Time Window</th>
                <th>Assigned Vehicle</th>
                <th>Assigned Driver / Team</th>
                <th>Waste Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching schedules...
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold text-dark">{s.route_code}</div>
                      <div className="small text-muted">{s.service_area}</div>
                    </td>
                    <td className="small">
                      <div className="fw-semibold">{s.date_str}</div>
                      <div className="text-muted">{s.time_slot}</div>
                    </td>
                    <td className="small fw-medium">{s.vehicle}</td>
                    <td className="small fw-semibold text-dark">
                      <i className="bi bi-person-badge text-success me-1"></i>
                      {s.driver_team}
                    </td>
                    <td>
                      <span className={`badge bg-${wasteTypeColor[s.waste_type] || "secondary"}-subtle text-${wasteTypeColor[s.waste_type] || "secondary"}-emphasis`}>
                        {s.waste_type}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 bg-${statusColor[s.status] || "secondary"}-subtle text-${statusColor[s.status] || "secondary"}-emphasis fw-semibold`}
                        style={{ width: "130px" }}
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value as ScheduleItem["status"])}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No schedule entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Schedule Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Create Collection Schedule</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddSchedule}>
                <div className="modal-body p-4">
                  {validationError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {validationError}
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Route Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Route CMC-01"
                        value={form.routeCode}
                        onChange={(e) => setForm({ ...form, routeCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">CMC Service Area</label>
                      <select
                        className="form-select"
                        value={form.serviceArea}
                        onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                      >
                        {COLOMBO_SERVICE_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assigned Driver (Mandatory) <span className="text-danger">*</span>
                      </label>
                      {collectors.length > 0 ? (
                        <select
                          className="form-select border-success fw-semibold"
                          value={form.driverTeam}
                          onChange={(e) => setForm({ ...form, driverTeam: e.target.value })}
                          required
                        >
                          <option value="">-- Select Driver --</option>
                          {collectors.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name} ({c.id})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control border-success fw-semibold"
                          placeholder="e.g. S. Perera"
                          value={form.driverTeam}
                          onChange={(e) => setForm({ ...form, driverTeam: e.target.value })}
                          required
                        />
                      )}
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        * Route cannot be created without a driver
                      </small>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assigned Vehicle <span className="text-danger">*</span>
                      </label>
                      {trucks.length > 0 ? (
                        <select
                          className="form-select"
                          value={form.vehicle}
                          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                          required
                        >
                          <option value="">-- Select Vehicle --</option>
                          {trucks.map((t) => (
                            <option key={t.id} value={`${t.plate} (${t.id})`}>
                              {t.plate} - {t.type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. WP CAB-4521"
                          value={form.vehicle}
                          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Time Slot</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 06:00 AM - 10:00 AM"
                        value={form.timeSlot}
                        onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Waste Type</label>
                      <select
                        className="form-select"
                        value={form.wasteType}
                        onChange={(e) => setForm({ ...form, wasteType: e.target.value as ScheduleItem["waste_type"] })}
                      >
                        <option value="Organic">Organic</option>
                        <option value="Recyclables">Recyclables</option>
                        <option value="Hazardous">Hazardous</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Schedule"}
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

export default ScheduleManagement;