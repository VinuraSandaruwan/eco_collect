import { useState } from "react";

interface ScheduleItem {
  id: string;
  day: number; // Day of month (1-31)
  routeCode: string;
  serviceArea: string;
  dateStr: string;
  timeSlot: string;
  vehicle: string;
  driverTeam: string;
  wasteType: "Organic" | "Recyclables" | "Hazardous" | "General";
  status: "Scheduled" | "In Progress" | "Completed" | "Delayed";
}

const initialSchedules: ScheduleItem[] = [
  {
    id: "SCH-101",
    day: 1,
    routeCode: "Route A-12",
    serviceArea: "Sector A - Negombo North",
    dateStr: "Aug 01, 2026",
    timeSlot: "06:00 AM - 10:00 AM",
    vehicle: "WP CAB-4521 (TRK-01)",
    driverTeam: "Team Alpha (S. Perera)",
    wasteType: "Organic",
    status: "Completed",
  },
  {
    id: "SCH-102",
    day: 3,
    routeCode: "Route B-04",
    serviceArea: "Sector B - Commercial Hub",
    dateStr: "Aug 03, 2026",
    timeSlot: "08:30 AM - 12:00 PM",
    vehicle: "WP CAD-7743 (TRK-02)",
    driverTeam: "Team Beta (K. Fernando)",
    wasteType: "Recyclables",
    status: "Completed",
  },
  {
    id: "SCH-103",
    day: 8,
    routeCode: "Route C-09",
    serviceArea: "Industrial Zone West",
    dateStr: "Aug 08, 2026",
    timeSlot: "01:00 PM - 03:30 PM",
    vehicle: "WP CAE-1290 (TRK-03)",
    driverTeam: "Hazmat Crew (M. Silva)",
    wasteType: "Hazardous",
    status: "Completed",
  },
  {
    id: "SCH-104",
    day: 14,
    routeCode: "Route D-01",
    serviceArea: "Sector D - Residential Zone",
    dateStr: "Aug 14, 2026",
    timeSlot: "06:00 AM - 11:00 AM",
    vehicle: "WP CAB-4521 (TRK-01)",
    driverTeam: "Team Alpha (S. Perera)",
    wasteType: "General",
    status: "In Progress",
  },
  {
    id: "SCH-105",
    day: 14,
    routeCode: "Route A-08",
    serviceArea: "Central Market & Fort",
    dateStr: "Aug 14, 2026",
    timeSlot: "10:30 AM - 02:00 PM",
    vehicle: "WP CAF-6602 (TRK-04)",
    driverTeam: "Team Gamma (R. Jayasuriya)",
    wasteType: "Organic",
    status: "Scheduled",
  },
  {
    id: "SCH-106",
    day: 18,
    routeCode: "Route B-02",
    serviceArea: "Sector B - Coastal Strip",
    dateStr: "Aug 18, 2026",
    timeSlot: "07:00 AM - 11:30 AM",
    vehicle: "WP CAD-7743 (TRK-02)",
    driverTeam: "Team Beta (K. Fernando)",
    wasteType: "Recyclables",
    status: "Scheduled",
  },
  {
    id: "SCH-107",
    day: 22,
    routeCode: "Route E-05",
    serviceArea: "Hospital & Healthcare Sector",
    dateStr: "Aug 22, 2026",
    timeSlot: "05:30 AM - 08:30 AM",
    vehicle: "WP CAE-1290 (TRK-03)",
    driverTeam: "Hazmat Crew (M. Silva)",
    wasteType: "Hazardous",
    status: "Scheduled",
  },
];

const wasteColor: Record<ScheduleItem["wasteType"], string> = {
  Organic: "success",
  Recyclables: "primary",
  Hazardous: "danger",
  General: "secondary",
};

const statusBadgeColor: Record<ScheduleItem["status"], string> = {
  Scheduled: "info",
  "In Progress": "warning",
  Completed: "success",
  Delayed: "danger",
};

function ScheduleManagement() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    routeCode: "",
    serviceArea: "",
    date: "2026-08-15",
    timeSlot: "06:00 AM - 10:00 AM",
    vehicle: "WP CAB-4521 (TRK-01)",
    driverTeam: "Team Alpha (S. Perera)",
    wasteType: "Organic" as ScheduleItem["wasteType"],
  });

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.routeCode || !form.serviceArea || !form.date) return;

    const dayNum = parseInt(form.date.split("-")[2], 10) || 15;

    const newItem: ScheduleItem = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      day: dayNum,
      routeCode: form.routeCode,
      serviceArea: form.serviceArea,
      dateStr: form.date,
      timeSlot: form.timeSlot,
      vehicle: form.vehicle,
      driverTeam: form.driverTeam,
      wasteType: form.wasteType,
      status: "Scheduled",
    };

    setSchedules([...schedules, newItem]);
    setShowModal(false);
    setForm({
      routeCode: "",
      serviceArea: "",
      date: "2026-08-15",
      timeSlot: "06:00 AM - 10:00 AM",
      vehicle: "WP CAB-4521 (TRK-01)",
      driverTeam: "Team Alpha (S. Perera)",
      wasteType: "Organic",
    });
  };

  // Calendar configuration (August 2026: 31 Days, Starts on Saturday -> 6 empty padding cells)
  const totalDaysInMonth = 31;
  const startDayOffset = 6; // Aug 1, 2026 is Saturday
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: startDayOffset }, (_, i) => 31 - startDayOffset + 1 + i);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Schedules
          </h2>
          <p className="text-muted mb-0">
            Configure and oversee municipal waste collection routes and team assignments[cite: 1].
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* Calendar / Table View Toggle Buttons */}
          <div className="btn-group shadow-sm">
            <button
              className={`btn btn-sm ${
                viewMode === "calendar" ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setViewMode("calendar")}
            >
              <i className="bi bi-calendar3 me-1"></i> Calendar View
            </button>
            <button
              className={`btn btn-sm ${
                viewMode === "table" ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setViewMode("table")}
            >
              <i className="bi bi-list-ul me-1"></i> Table View
            </button>
          </div>

          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            Add Schedule
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-calendar-check text-success"></i>
                Total Scheduled Routes
              </div>
              <div className="fs-3 fw-bold">{schedules.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-truck text-primary"></i>
                Active Today
              </div>
              <div className="fs-3 fw-bold text-primary">
                {schedules.filter((s) => s.day === 14).length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-recycle text-success"></i>
                Recyclable Routes
              </div>
              <div className="fs-3 fw-bold text-success">
                {schedules.filter((s) => s.wasteType === "Recyclables").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-shield-exclamation text-danger"></i>
                Hazmat Operations
              </div>
              <div className="fs-3 fw-bold text-danger">
                {schedules.filter((s) => s.wasteType === "Hazardous").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CALENDAR VIEW ================= */}
      {viewMode === "calendar" && (
        <div className="card shadow-sm border-0">
          {/* Calendar Month Header */}
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-3">
              <h5 className="fw-bold mb-0 text-dark">August 2026</h5>
              <div className="badge bg-success-subtle text-success-emphasis px-2 py-1">
                Colombo Municipal Zone
              </div>
            </div>
            {/* Color Legend */}
            <div className="d-flex align-items-center gap-3 small text-muted">
              <span className="d-flex align-items-center gap-1">
                <span className="badge bg-success rounded-circle p-1"> </span> Organic
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="badge bg-primary rounded-circle p-1"> </span> Recyclables
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="badge bg-danger rounded-circle p-1"> </span> Hazardous
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="badge bg-secondary rounded-circle p-1"> </span> General
              </span>
            </div>
          </div>

          <div className="card-body p-0">
            {/* Day Names Row */}
            <div
              className="d-grid text-center fw-semibold text-muted bg-light border-bottom py-2 small text-uppercase"
              style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days Grid */}
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: "repeat(7, 1fr)",
                backgroundColor: "#dee2e6",
                gap: "1px",
              }}
            >
              {/* Previous Month Padding */}
              {paddingArray.map((pDay, idx) => (
                <div
                  key={`pad-${idx}`}
                  className="bg-white p-2 text-end text-muted opacity-25"
                  style={{ minHeight: "115px" }}
                >
                  <span className="small">{pDay}</span>
                </div>
              ))}

              {/* Current Month Active Days */}
              {daysArray.map((dayNum) => {
                const daySchedules = schedules.filter((s) => s.day === dayNum);
                const isToday = dayNum === 14;

                return (
                  <div
                    key={dayNum}
                    className={`bg-white p-2 d-flex flex-col justify-content-between transition-all ${
                      isToday ? "bg-success-subtle" : ""
                    }`}
                    style={{ minHeight: "115px" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span
                        className={`small fw-bold ${
                          isToday
                            ? "badge bg-success rounded-pill px-2 py-1"
                            : "text-dark"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[10px] text-success fw-bold uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Schedule Badges inside cell */}
                    <div className="d-flex flex-column gap-1 overflow-hidden">
                      {daySchedules.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedSchedule(item)}
                          className={`p-1 rounded text-start cursor-pointer shadow-xs border-start border-3 border-${wasteColor[item.wasteType]} bg-${wasteColor[item.wasteType]}-subtle text-${wasteColor[item.wasteType]}-emphasis`}
                          style={{ fontSize: "11px", lineHeight: "1.2" }}
                          title="Click to view details"
                        >
                          <div className="fw-bold truncate">{item.routeCode}</div>
                          <div className="text-muted truncate" style={{ fontSize: "9px" }}>
                            {item.timeSlot.split("-")[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Route Code</th>
                  <th>Service Area</th>
                  <th>Waste Category</th>
                  <th>Assigned Vehicle</th>
                  <th>Driver / Crew</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedSchedule(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <span className="fw-bold text-dark">{item.routeCode}</span>
                      <div className="small text-muted">{item.id}</div>
                    </td>
                    <td>
                      <span className="fw-semibold">{item.serviceArea}</span>
                    </td>
                    <td>
                      <span
                        className={`badge bg-${wasteColor[item.wasteType]}-subtle text-${wasteColor[item.wasteType]}-emphasis`}
                      >
                        {item.wasteType}
                      </span>
                    </td>
                    <td className="small text-muted">{item.vehicle}</td>
                    <td className="small text-dark fw-medium">{item.driverTeam}</td>
                    <td>
                      <div className="small fw-semibold">{item.dateStr}</div>
                      <div className="small text-muted">{item.timeSlot}</div>
                    </td>
                    <td>
                      <span
                        className={`badge bg-${statusBadgeColor[item.status]}-subtle text-${statusBadgeColor[item.status]}-emphasis`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light text-danger"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedules(schedules.filter((s) => s.id !== item.id));
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= DETAILS POPUP MODAL (When clicking a schedule) ================= */}
      {selectedSchedule && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-white border-bottom">
                <div>
                  <span className="badge bg-success-subtle text-success-emphasis me-2">
                    {selectedSchedule.routeCode}
                  </span>
                  <span className="fw-bold text-dark">{selectedSchedule.id}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSchedule(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold mb-3">{selectedSchedule.serviceArea}</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Waste Type
                    </span>
                    <span
                      className={`badge bg-${wasteColor[selectedSchedule.wasteType]}-subtle text-${wasteColor[selectedSchedule.wasteType]}-emphasis`}
                    >
                      {selectedSchedule.wasteType}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Status
                    </span>
                    <span
                      className={`badge bg-${statusBadgeColor[selectedSchedule.status]}-subtle text-${statusBadgeColor[selectedSchedule.status]}-emphasis`}
                    >
                      {selectedSchedule.status}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Date & Slot
                    </span>
                    <div className="small fw-semibold">{selectedSchedule.dateStr}</div>
                    <div className="small text-muted">{selectedSchedule.timeSlot}</div>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Vehicle & Team
                    </span>
                    <div className="small fw-semibold">{selectedSchedule.vehicle}</div>
                    <div className="small text-muted">{selectedSchedule.driverTeam}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSchedule(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD SCHEDULE MODAL ================= */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Add Collection Schedule</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddSchedule}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Route Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Route A-15"
                      value={form.routeCode}
                      onChange={(e) => setForm({ ...form, routeCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Service Area / Zone
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sector C - Fort Market"
                      value={form.serviceArea}
                      onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Waste Category
                      </label>
                      <select
                        className="form-select"
                        value={form.wasteType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            wasteType: e.target.value as ScheduleItem["wasteType"],
                          })
                        }
                      >
                        <option value="Organic">Organic Waste</option>
                        <option value="Recyclables">Recyclables</option>
                        <option value="Hazardous">Hazardous</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Vehicle
                      </label>
                      <select
                        className="form-select"
                        value={form.vehicle}
                        onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                      >
                        <option value="WP CAB-4521 (TRK-01)">WP CAB-4521 (TRK-01)</option>
                        <option value="WP CAD-7743 (TRK-02)">WP CAD-7743 (TRK-02)</option>
                        <option value="WP CAE-1290 (TRK-03)">WP CAE-1290 (TRK-03)</option>
                        <option value="WP CAF-6602 (TRK-04)">WP CAF-6602 (TRK-04)</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Driver / Team
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Team Alpha"
                        value={form.driverTeam}
                        onChange={(e) => setForm({ ...form, driverTeam: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3">
                    Save Schedule
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