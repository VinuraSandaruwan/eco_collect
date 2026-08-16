import { useState, useEffect } from "react";
import type { CommunityEvent } from "../../types/database.types";
import { getCommunityEvents, addCommunityEvent, updateCommunityEventStatus } from "../../services/apiService";

const statusBadgeColor: Record<CommunityEvent["status"], string> = {
  Approved: "success",
  "Pending Review": "warning",
  Completed: "info",
  Rejected: "danger",
};

function CommunityEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [assignedTruckInput, setAssignedTruckInput] = useState("WP CAB-4521 (TRK-01)");
  const [submitting, setSubmitting] = useState(false);

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

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getCommunityEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateOfficialEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.eventDate) return;
    setSubmitting(true);

    const created = await addCommunityEvent({
      title: form.title,
      organizer_type: "Municipal Council",
      organizer_name: form.organizerName,
      organizer_contact: form.organizerContact,
      location: form.location,
      zone: form.zone,
      event_date: form.eventDate,
      event_time: form.eventTime,
      expected_volunteers: parseInt(form.expectedVolunteers) || 50,
      assigned_support_truck: form.assignedSupportTruck,
      support_requested: form.supportRequested,
      status: "Approved",
    });

    setEvents((prev) => [created, ...prev.filter((ev) => ev.id !== created.id)]);
    setShowCreateModal(false);
    setSubmitting(false);
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

  const handleUpdateStatus = async (
    id: string,
    newStatus: CommunityEvent["status"],
    assignedTruck?: string
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: newStatus, assigned_support_truck: assignedTruck || e.assigned_support_truck }
          : e
      )
    );
    await updateCommunityEventStatus(id, newStatus, assignedTruck);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase()) ||
      evt.organizer_name.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "pending") return matchesSearch && evt.status === "Pending Review";
    if (activeTab === "approved") return matchesSearch && evt.status === "Approved";
    return matchesSearch;
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
            Support citizen-led environmental drives, allocate municipal support trucks, and organize official cleanups.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-calendar-plus"></i>
          Schedule Municipal Drive
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Drives</div>
              <div className="fs-3 fw-bold">{loading ? "..." : events.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Pending Review</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : events.filter((e) => e.status === "Pending Review").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Approved & Scheduled</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : events.filter((e) => e.status === "Approved").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Completed</div>
              <div className="fs-3 fw-bold text-info">
                {loading ? "..." : events.filter((e) => e.status === "Completed").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="btn-group shadow-sm">
            <button
              className={`btn btn-sm ${activeTab === "all" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("all")}
            >
              All Events
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
              Approved ({events.filter((e) => e.status === "Approved").length})
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
              placeholder="Search drives, organizer, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Event & Title</th>
                <th>Organizer</th>
                <th>Location & Zone</th>
                <th>Date & Time</th>
                <th>Volunteers</th>
                <th>Assigned Support Truck</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching community events...
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      <div className="fw-semibold text-dark">{evt.title}</div>
                      <div className="small text-muted">{evt.id}</div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{evt.organizer_name}</div>
                      <div className="small text-muted">{evt.organizer_type}</div>
                    </td>
                    <td className="small">
                      <div>{evt.location}</div>
                      <span className="badge bg-light text-dark border">{evt.zone}</span>
                    </td>
                    <td className="small">
                      <div className="fw-semibold text-dark">{evt.event_date}</div>
                      <div className="text-muted">{evt.event_time}</div>
                    </td>
                    <td className="fw-bold text-success">{evt.expected_volunteers}</td>
                    <td className="small">
                      {evt.assigned_support_truck ? (
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          <i className="bi bi-truck me-1"></i>
                          {evt.assigned_support_truck}
                        </span>
                      ) : (
                        <span className="text-muted fst-italic">None Assigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${statusBadgeColor[evt.status] || "secondary"}-subtle text-${statusBadgeColor[evt.status] || "secondary"}-emphasis`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {evt.status === "Pending Review" && (
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => {
                            setSelectedEvent(evt);
                            setAssignedTruckInput("WP CAB-4521 (TRK-01)");
                          }}
                        >
                          Review Proposal
                        </button>
                      )}
                      {evt.status === "Approved" && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleUpdateStatus(evt.id, "Completed")}
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No community events found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Proposal Modal */}
      {selectedEvent && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Review Community Cleanup Request</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <h6 className="fw-bold">{selectedEvent.title}</h6>
                <p className="small text-muted mb-3">Organizer: {selectedEvent.organizer_name} ({selectedEvent.organizer_contact})</p>
                <div className="p-3 bg-light rounded mb-3 small">
                  <strong>Requested Municipal Support:</strong>
                  <div className="text-muted mt-1">{selectedEvent.support_requested}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Allocate Municipal Truck</label>
                  <select
                    className="form-select"
                    value={assignedTruckInput}
                    onChange={(e) => setAssignedTruckInput(e.target.value)}
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
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleUpdateStatus(selectedEvent.id, "Rejected")}
                >
                  Reject Proposal
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-3"
                  onClick={() => handleUpdateStatus(selectedEvent.id, "Approved", assignedTruckInput)}
                >
                  Approve & Assign Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Official Drive Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Schedule Official Municipal Drive</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOfficialEvent}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Event Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Negombo Coastal Plastic Removal"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kudapaduwa Beach Stretch"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Event Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Aug 28, 2026"
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Expected Volunteers</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.expectedVolunteers}
                        onChange={(e) => setForm({ ...form, expectedVolunteers: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Event"}
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