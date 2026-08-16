import { useState, useEffect } from "react";
import type { PaymentTransaction } from "../../types/database.types";
import { getTransactions, addTransaction, updateTransactionStatus } from "../../services/apiService";

const statusBadgeColor: Record<PaymentTransaction["status"], string> = {
  Completed: "success",
  Pending: "warning",
  Refunded: "danger",
};

const typeBadgeColor: Record<PaymentTransaction["type"], string> = {
  "Service Fee": "primary",
  "Marketplace Sale": "success",
  "Penalty / Fine": "danger",
  "Special Pickup": "secondary",
};

function PaymentsManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New payment form state
  const [form, setForm] = useState({
    type: "Service Fee" as PaymentTransaction["type"],
    payerEntity: "",
    amount: "",
    paymentMethod: "Credit/Debit Card" as PaymentTransaction["payment_method"],
  });

  const fetchTransactionsList = async () => {
    setLoading(true);
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactionsList();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.payerEntity || !form.amount) return;
    setSubmitting(true);

    const created = await addTransaction({
      type: form.type,
      payer_entity: form.payerEntity,
      amount: parseFloat(form.amount) || 0,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Completed",
      payment_method: form.paymentMethod,
    });

    setTransactions((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      type: "Service Fee",
      payerEntity: "",
      amount: "",
      paymentMethod: "Credit/Debit Card",
    });
  };

  const handleStatusChange = async (id: string, newStatus: PaymentTransaction["status"]) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await updateTransactionStatus(id, newStatus);
  };

  const filtered = transactions.filter((trx) => {
    const matchesSearch =
      trx.payer_entity.toLowerCase().includes(search.toLowerCase()) ||
      trx.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? trx.type === typeFilter : true;
    const matchesStatus = statusFilter ? trx.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Payments & Financial Ledger
          </h2>
          <p className="text-muted mb-0">
            Monitor municipal waste collection fees, marketplace revenue, and citizen payment records.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Record Transaction
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Ledger Volume</div>
              <div className="fs-3 fw-bold">{loading ? "..." : transactions.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Completed</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : transactions.filter((t) => t.status === "Completed").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Pending</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : transactions.filter((t) => t.status === "Pending").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Refunded</div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : transactions.filter((t) => t.status === "Refunded").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap gap-3 justify-content-between align-items-center py-3">
          <div className="position-relative" style={{ minWidth: "260px", flex: 1 }}>
            <i
              className="bi bi-search position-absolute text-muted"
              style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
            ></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by payer name or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "170px" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Payment Types</option>
            <option value="Service Fee">Service Fee</option>
            <option value="Marketplace Sale">Marketplace Sale</option>
            <option value="Penalty / Fine">Penalty / Fine</option>
            <option value="Special Pickup">Special Pickup</option>
          </select>
          <select
            className="form-select"
            style={{ minWidth: "150px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Payment Category</th>
                <th>Payer Entity</th>
                <th>Amount (LKR)</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching transactions from Supabase...
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => (
                  <tr key={trx.id}>
                    <td className="fw-bold font-monospace">{trx.id}</td>
                    <td>
                      <span className={`badge bg-${typeBadgeColor[trx.type] || "secondary"}-subtle text-${typeBadgeColor[trx.type] || "secondary"}-emphasis`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{trx.payer_entity}</td>
                    <td className="fw-bold text-success">LKR {trx.amount.toLocaleString()}</td>
                    <td className="small text-muted">{trx.date}</td>
                    <td className="small">{trx.payment_method}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 bg-${statusBadgeColor[trx.status] || "secondary"}-subtle text-${statusBadgeColor[trx.status] || "secondary"}-emphasis fw-semibold`}
                        style={{ width: "130px" }}
                        value={trx.status}
                        onChange={(e) => handleStatusChange(trx.id, e.target.value as PaymentTransaction["status"])}
                      >
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No transactions match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Record New Transaction</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Payer Entity / Resident</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. EcoRecycling Corp"
                      value={form.payerEntity}
                      onChange={(e) => setForm({ ...form, payerEntity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Transaction Category</label>
                      <select
                        className="form-select"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as PaymentTransaction["type"] })}
                      >
                        <option value="Service Fee">Service Fee</option>
                        <option value="Marketplace Sale">Marketplace Sale</option>
                        <option value="Penalty / Fine">Penalty / Fine</option>
                        <option value="Special Pickup">Special Pickup</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Amount (LKR)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 15000"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Recording..." : "Record Transaction"}
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

export default PaymentsManagement;