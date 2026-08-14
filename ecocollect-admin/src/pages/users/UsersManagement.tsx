import { useState } from "react";

interface Resident {
  id: string;
  name: string;
  phone: string;
  address: string;
  zone: string;
  plan: "Basic" | "Standard" | "Premium";
  status: "Active" | "Suspended";
  joined: string;
}

const initialUsers: Resident[] = [
  {
    id: "USR-001",
    name: "A. Wickramasinghe",
    phone: "071 111 2233",
    address: "No. 12, Lake Road",
    zone: "Negombo North",
    plan: "Standard",
    status: "Active",
    joined: "Jan 14, 2024",
  },
  {
    id: "USR-002",
    name: "N. Rajapaksha",
    phone: "077 222 3344",
    address: "No. 45, Beach Road",
    zone: "Negombo South",
    plan: "Premium",
    status: "Active",
    joined: "Feb 02, 2024",
  },
  {
    id: "USR-003",
    name: "T. Gunasekara",
    phone: "076 333 4455",
    address: "No. 8, Church Street",
    zone: "Kochchikade",
    plan: "Basic",
    status: "Suspended",
    joined: "Mar 20, 2024",
  },
  {
    id: "USR-004",
    name: "D. Herath",
    phone: "070 444 5566",
    address: "No. 21, Kandy Road",
    zone: "Kandana",
    plan: "Standard",
    status: "Active",
    joined: "Apr 08, 2024",
  },
];

const planColor: Record<Resident["plan"], string> = {
  Basic: "secondary",
  Standard: "primary",
  Premium: "success",
};

function UsersManagement() {
  const [users, setUsers] = useState<Resident[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State for Adding New User
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    zone: "Negombo North",
    plan: "Standard" as Resident["plan"],
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return;

    const newUser: Resident = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      phone: form.phone,
      address: form.address,
      zone: form.zone,
      plan: form.plan,
      status: "Active",
      joined: "Aug 14, 2026",
    };

    setUsers([newUser, ...users]);
    setShowModal(false);
    setForm({
      name: "",
      phone: "",
      address: "",
      zone: "Negombo North",
      plan: "Standard",
    });
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.address.toLowerCase().includes(search.toLowerCase()) ||
      u.zone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? u.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Users Management
          </h2>
          <p className="text-muted mb-0">
            Manage registered residents and their collection accounts.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-person-plus"></i>
          Add New User
        </button>
      </div>

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Users</div>
              <div className="fs-3 fw-bold">{users.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Active</div>
              <div className="fs-3 fw-bold text-success">
                {users.filter((u) => u.status === "Active").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Suspended</div>
              <div className="fs-3 fw-bold text-danger">
                {users.filter((u) => u.status === "Suspended").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Premium Plan Users</div>
              <div className="fs-3 fw-bold text-primary">
                {users.filter((u) => u.plan === "Premium").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
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
              placeholder="Search by name, address, or zone..."
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
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Zone</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold"
                        style={{ width: "34px", height: "34px", fontSize: "13px" }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold">{u.name}</div>
                        <div className="small text-muted">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="small">{u.phone}</td>
                  <td className="small text-muted">{u.address}</td>
                  <td className="small">{u.zone}</td>
                  <td>
                    <span className={`badge bg-${planColor[u.plan]}-subtle text-${planColor[u.plan]}-emphasis`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="small text-muted">{u.joined}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        u.status === "Active" ? "success" : "danger"
                      }-subtle text-${u.status === "Active" ? "success" : "danger"}-emphasis`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-light me-1" title="Edit">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      title={u.status === "Active" ? "Suspend" : "Reactivate"}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      <i className={`bi ${u.status === "Active" ? "bi-slash-circle" : "bi-check-circle text-success"}`}></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No users match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {users.length} users
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Add New Resident Account</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. S. Wickramasinghe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 077 123 4567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assigned Zone
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
                        <option value="Colombo Central">Colombo Central</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. No. 15/A, Station Road"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Collection Service Plan
                    </label>
                    <select
                      className="form-select"
                      value={form.plan}
                      onChange={(e) =>
                        setForm({ ...form, plan: e.target.value as Resident["plan"] })
                      }
                    >
                      <option value="Basic">Basic (Standard Weekly Pickup)</option>
                      <option value="Standard">Standard (Bi-Weekly + Recyclables)</option>
                      <option value="Premium">Premium (Daily + On-Demand Extra Bags)</option>
                    </select>
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
                    Register User
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

export default UsersManagement;