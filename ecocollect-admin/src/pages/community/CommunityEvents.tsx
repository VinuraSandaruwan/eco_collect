import { useState } from "react";

interface CleanupEvent {
  id: string;
  title: string;
  organizerType: "Citizen" | "Municipal Council";
  organizerName: string;
  organizerContact: string;
  location: string;
  zone: string;
  eventDate: string;
  eventTime: string;
  expectedVolunteers: number;
  assignedSupportTruck?: string;
  supportRequested: string;
  status: "Pending Review" | "Approved" | "Completed" | "Rejected";
}

const initialEvents: CleanupEvent[] = [
  {
    id: "EVT-101",
    title: "Negombo Main Beach Coastal Cleanup Drive",
    organizerType: "Municipal Council",
    organizerName: "Municipal Environmental Division",
    organizerContact: "031 222 4567",
    location: "Kudapaduwa Beach Stretch",
    zone: "Negombo North",
    eventDate: "Aug 22, 2026",
    eventTime: "06:30 AM - 10:30 AM",
    expectedVolunteers: 85,
    assignedSupportTruck: "WP CAB-4521 (TRK-01)",
    supportRequested: "2 Compactor Trucks + 200 Heavy Duty Trash Sacks",
    status: "Approved",
  },
  {
    id: "EVT-102",
    title: "Lagoon Canal Plastic Recovery Initiative",
    organizerType: "Citizen",
    organizerName: "Youth Green Volunteers (Kavinda P.)",
    organizerContact: "077 345 6789",
    location: "Mankuliya Canal Bridge",
    zone: "Negombo South",
    eventDate: "Aug 29, 2026",
    eventTime: "07:00 AM - 11:00 AM",
    expectedVolunteers: 40,
    supportRequested: "1 Tipper Truck at 10:30 AM to collect plastic waste",
    status: "Pending Review",
  },
  {
    id: "EVT-103",
    title: "Kochchikade Market Area Litter Clearing",
    organizerType: "Citizen",
    organizerName: "Kochchikade Traders Association",
    organizerContact: "071 889 2211",
    location: "Old Railway Station Road",
    zone: "Kochchikade",
    eventDate: "Aug 15, 2026",
    eventTime: "06:00 AM - 09:00 AM",
    expectedVolunteers: 25,
    assignedSupportTruck: "WP CAD-7743 (TRK-02)",
    supportRequested: "Municipal Tractor Loader Assistance",
    status: "Completed",
  },
];

const statusBadgeColor: Record<CleanupEvent["status"], string> = {
  Approved: "success",
  "Pending Review": "warning",
  Completed: "info",
  Rejected: "danger",
};

function CommunityEvents() {
  const [events, setEvents] = useState<CleanupEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CleanupEvent | null>(null);
  const [assignedTruckInput, setAssignedTruckInput] = useState("WP CAB-4521 (TRK-01)");

  // Form state for creating an Official Municipal Event
  const [form, setForm] = useState({
    title: "",
    organizerName: "Municipal Environmental Division",
    organizerContact: "031 222 4567",
    location: "",
    zone: "Negombo North",
    eventDate: "",
    eventTime: "07:00 AM - 10:30 AM",
    expectedVolunteers: "50",
    assignedSupportTruck: "WP CAB-4521 (TRK-01)",
    supportRequested: "Direct Council Logistics Support",
  });

  const handleCreateOfficialEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.eventDate) return;

    const newEvent: CleanupEvent = {
      id: `EVT-${Math.floor(104 + events.length)}`,
      title: form.title,
      organizerType: "Municipal Council",
      organizerName: form.organizerName,
      organizerContact: form.organizerContact,
      location: form.location,
      zone: form.zone,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      expectedVolunteers: parseInt(form.expectedVolunteers, 10) || 30,
      assignedSupportTruck: form.assignedSupportTruck,
      supportRequested: form.supportRequested,
      status: "Approved",
    };

    setEvents([newEvent, ...events]);
    setShowCreateModal(false);
    setForm({
      title: "",
      organizerName: "Municipal Environmental Division",
      organizerContact: "031 222 4567",
      location: "",
      zone: "Negombo North",
      eventDate: "",
      eventTime: "07:00 AM - 10:30 AM",
      expectedVolunteers: "50",
      assignedSupportTruck: "WP CAB-4521 (TRK-01)",
      supportRequested: "Direct Council Logistics Support",
    });
  };

  const handleApproveEvent = (id: string) => {
    setEvents(
      events.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              status: "Approved",
              assignedSupportTruck: assignedTruckInput,
            }
          : ev
      )
    );
    setSelectedEvent(null);
  };

  const handleRejectEvent = (id: string) => {
    setEvents(
      events.map((ev) => (ev.id === id ? { ...ev, status: "Rejected" } : ev))
    );
    setSelectedEvent(null);
  };

  const handleMarkCompleted = (id: string) => {
    setEvents(
      events.map((ev) => (ev.id === id ? { ...ev, status: "Completed" } : ev))
    );
  };

  const filtered = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.organizerName.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "pending"
        ? ev.status === "Pending Review"
        : ev.status === "Approved";

    return matchesSearch && matchesTab;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Community Cleanup Events
          </h2>
          <p className="text-muted mb-0">
            Review citizen cleanup applications, organize municipal drives, and allocate waste collection trucks.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Create Municipal Event
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-calendar-event text-success"></i>
                Total Campaigns
              </div>
              <div className="fs-3 fw-bold">{events.length}</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-hourglass-split text-warning"></i>
                Pending Citizen Proposals
              </div>
              <div className="fs-3 fw-bold text-warning">
                {events.filter((e) => e.status === "Pending Review").length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-people text-primary"></i>
                Volunteers Mobilized
              </div>
              <div className="fs-3 fw-bold text-primary">
                {events.reduce((acc, curr) => acc + curr.expectedVolunteers, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-check2-all text-success"></i>
                Completed Cleanups
              </div>
              <div className="fs-3 fw-bold text-success">
                {events.filter((e) => e.status === "Completed").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card shadow-sm border-0">
        {/* Tab Switcher & Search Bar */}
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-3 py-3">
          <div className="btn-group shadow-sm">
            <button
              className={`btn btn-sm ${activeTab === "all" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("all")}
            >
              All Events ({events.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "pending" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approval ({events.filter((e) => e.status === "Pending Review").length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "approved" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("approved")}
            >
              Approved & Active ({events.filter((e) => e.status === "Approved").length})
            </button>
          </div>

          <div className="position-relative" style={{ minWidth: "260px" }}>
            <i
              className="bi bi-search position-absolute text-muted"
              style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
            ></i>
            <input
              type="text"
              className="form-control form-control-sm ps-5"
              placeholder="Search event title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Event Title</th>
                <th>Initiator</th>
                <th>Location & Zone</th>
                <th>Date & Time</th>
                <th>Est. Volunteers</th>
                <th>Assigned Support Truck</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <div className="fw-semibold text-dark">{ev.title}</div>
                    <div className="small text-muted">{ev.id}</div>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        ev.organizerType === "Municipal Council" ? "success" : "primary"
                      }-subtle text-${
                        ev.organizerType === "Municipal Council" ? "success" : "primary"
                      }-emphasis d-block mb-1`}
                      style={{ width: "fit-content" }}
                    >
                      {ev.organizerType}
                    </span>
                    <div className="small text-dark fw-medium">{ev.organizerName}</div>
                  </td>
                  <td>
                    <div className="small text-dark fw-medium">{ev.location}</div>
                    <div className="small text-muted">{ev.zone}</div>
                  </td>
                  <td>
                    <div className="small fw-semibold">{ev.eventDate}</div>
                    <div className="small text-muted">{ev.eventTime}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-people me-1 text-primary"></i>
                      {ev.expectedVolunteers}
                    </span>
                  </td>
                  <td>
                    {ev.assignedSupportTruck ? (
                      <span className="small text-success fw-semibold">
                        <i className="bi bi-truck me-1"></i>
                        {ev.assignedSupportTruck}
                      </span>
                    ) : (
                      <span className="small text-muted italic">None Assigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge bg-${statusBadgeColor[ev.status]}-subtle text-${
                        statusBadgeColor[ev.status]
                      }-emphasis`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {ev.status === "Pending Review" ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => setSelectedEvent(ev)}
                      >
                        Review & Approve
                      </button>
                    ) : ev.status === "Approved" ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleMarkCompleted(ev.id)}
                        title="Mark waste collection completed"
                      >
                        Mark Completed
                      </button>
                    ) : (
                      <span className="small text-muted">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No community cleanup events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REVIEW & APPROVAL MODAL ================= */}
      {selectedEvent && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Review Citizen Cleanup Proposal</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedEvent(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold mb-1 text-dark">{selectedEvent.title}</h5>
                <p className="small text-muted mb-3">{selectedEvent.location} ({selectedEvent.zone})</p>

                <div className="bg-light p-3 rounded mb-3">
                  <span className="small text-muted text-uppercase fw-semibold d-block mb-1">
                    Organizer Requested Assistance
                  </span>
                  <p className="small text-dark mb-0">{selectedEvent.supportRequested}</p>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Applicant Contact
                    </span>
                    <span className="small fw-semibold">{selectedEvent.organizerContact}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">
                      Date & Schedule
                    </span>
                    <span className="small fw-semibold">
                      {selectedEvent.eventDate} ({selectedEvent.eventTime})
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Assign Municipal Waste Truck for Disposal
                  </label>
                  <select
                    className="form-select"
                    value={assignedTruckInput}
                    onChange={(e) => setAssignedTruckInput(e.target.value)}
                  >
                    <option value="WP CAB-4521 (TRK-01)">WP CAB-4521 (Compactor Truck 01)</option>
                    <option value="WP CAD-7743 (TRK-02)">WP CAD-7743 (Compactor Truck 02)</option>
                    <option value="WP CAE-1290 (TRK-03)">WP CAE-1290 (Tipper Truck 03)</option>
                    <option value="WP CAF-6602 (TRK-04)">WP CAF-6602 (Tractor Loader 04)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer bg-light d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRejectEvent(selectedEvent.id)}
                >
                  Reject Proposal
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-3"
                  onClick={() => handleApproveEvent(selectedEvent.id)}
                >
                  Approve & Dispatch Truck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE OFFICIAL EVENT MODAL ================= */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Publish Official Municipal Cleanup Event</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateOfficialEvent}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Campaign / Event Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Negombo Lagoon Mangrove Waste Clearing"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Meeting Point / Target Location
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Pitipana Fishery Harbour Road"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Municipal Ward / Zone
                      </label>
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
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Target Volunteers
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.expectedVolunteers}
                        onChange={(e) => setForm({ ...form, expectedVolunteers: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Event Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Time Slot
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="07:00 AM - 10:30 AM"
                        value={form.eventTime}
                        onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Allocated Municipal Collection Truck
                    </label>
                    <select
                      className="form-select"
                      value={form.assignedSupportTruck}
                      onChange={(e) => setForm({ ...form, assignedSupportTruck: e.target.value })}
                    >
                      <option value="WP CAB-4521 (TRK-01)">WP CAB-4521 (TRK-01 - Compactor)</option>
                      <option value="WP CAD-7743 (TRK-02)">WP CAD-7743 (TRK-02 - Compactor)</option>
                      <option value="WP CAE-1290 (TRK-03)">WP CAE-1290 (TRK-03 - Tipper)</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3">
                    Publish Event to Citizen App
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

export default CommunityEvents;