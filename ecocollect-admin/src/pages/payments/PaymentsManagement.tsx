import { useState } from "react";

interface Transaction {
  id: string;
  type: "Service Fee" | "Marketplace Sale" | "Penalty / Fine" | "Special Pickup";
  payerEntity: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Refunded";
  paymentMethod: "Credit/Debit Card" | "Online Banking" | "Cash Deposit";
}

const initialTransactions: Transaction[] = [
  {
    id: "TRX-8924",
    type: "Service Fee",
    payerEntity: "Downtown Commercial Complex",
    amount: 45000,
    date: "Aug 14, 2026",
    status: "Completed",
    paymentMethod: "Online Banking",
  },
  {
    id: "TRX-8923",
    type: "Marketplace Sale",
    payerEntity: "EcoRecycling Lanka Corp",
    amount: 11250,
    date: "Aug 14, 2026",
    status: "Pending",
    paymentMethod: "Credit/Debit Card",
  },
  {
    id: "TRX-8922",
    type: "Penalty / Fine",
    payerEntity: "Industrial Sector B - Unit 4",
    amount: 15000,
    date: "Aug 13, 2026",
    status: "Completed",
    paymentMethod: "Cash Deposit",
  },
  {
    id: "TRX-8921",
    type: "Service Fee",
    payerEntity: "Northside Residential Co-op",
    amount: 8500,
    date: "Aug 13, 2026",
    status: "Refunded",
    paymentMethod: "Credit/Debit Card",
  },
  {
    id: "TRX-8920",
    type: "Marketplace Sale",
    payerEntity: "Green Organic Fertilizers Ltd",
    amount: 34000,
    date: "Aug 12, 2026",
    status: "Completed",
    paymentMethod: "Online Banking",
  },
  {
    id: "TRX-8919",
    type: "Special Pickup",
    payerEntity: "Kavinda Perera (Household)",
    amount: 3500,
    date: "Aug 11, 2026",
    status: "Completed",
    paymentMethod: "Credit/Debit Card",
  },
];

const statusBadgeColor: Record<Transaction["status"], string> = {
  Completed: "success",
  Pending: "warning",
  Refunded: "danger",
};

const typeBadgeColor: Record<Transaction["type"], string> = {
  "Service Fee": "primary",
  "Marketplace Sale": "success",
  "Penalty / Fine": "danger",
  "Special Pickup": "secondary",
};

function PaymentsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // New payment form state
  const [form, setForm] = useState({
    type: "Service Fee" as Transaction["type"],
    payerEntity: "",
    amount: "",
    paymentMethod: "Credit/Debit Card" as Transaction["paymentMethod"],
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.payerEntity || !form.amount) return;

    const newTrx: Transaction = {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: form.type,
      payerEntity: form.payerEntity,
      amount: parseFloat(form.amount) || 0,
      date: "Aug 14, 2026",
      status: "Completed",
      paymentMethod: form.paymentMethod,
    };

    setTransactions([newTrx, ...transactions]);
    setShowModal(false);
    setForm({
      type: "Service Fee",
      payerEntity: "",
      amount: "",
      paymentMethod: "Credit/Debit Card",
    });
  };

  const filtered = transactions.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.payerEntity.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const totalRevenue = transactions
    .filter((t) => t.status === "Completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = transactions
    .filter((t) => t.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const marketplaceRevenue = transactions
    .filter((t) => t.type === "Marketplace Sale" && t.status === "Completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Payments & Financials
          </h2>
          <p className="text-muted mb-0">
            Overview of municipal revenue, waste service fees, and circular marketplace transactions.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Record Payment
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-wallet2 text-success"></i>
                Total Revenue Collected
              </div>
              <div className="fs-3 fw-bold text-success">
                LKR {totalRevenue.toLocaleString()}
              </div>
              <div className="small text-muted mt-1">
                <span className="text-success fw-semibold">
                  <i className="bi bi-arrow-up-short"></i>+14.2%
                </span>{" "}
                vs last month
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-hourglass-split text-warning"></i>
                Pending Invoices
              </div>
              <div className="fs-3 fw-bold text-dark">
                LKR {pendingRevenue.toLocaleString()}
              </div>
              <div className="small text-muted mt-1">
                {transactions.filter((t) => t.status === "Pending").length} invoices awaiting settlement
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-shop text-primary"></i>
                Marketplace Sales
              </div>
              <div className="fs-3 fw-bold text-primary">
                LKR {marketplaceRevenue.toLocaleString()}
              </div>
              <div className="small text-muted mt-1">Recycled material brokerage</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-receipt-cutoff text-secondary"></i>
                Total Transactions
              </div>
              <div className="fs-3 fw-bold text-dark">{transactions.length}</div>
              <div className="small text-muted mt-1">Recorded audit entries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Graph & Quick Tools Row */}
      <div className="row g-4 mb-4">
        {/* Visual Monthly Revenue Chart Mock */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0 text-dark">Revenue Breakdown (Year 2026)</h6>
              <span className="badge bg-light text-muted">Monthly Collection</span>
            </div>
            <div className="card-body d-flex flex-column justify-content-end p-4" style={{ height: "240px" }}>
              <div className="d-flex align-items-end justify-content-between h-100 gap-2 border-bottom pb-2">
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success-subtle hover-bg-success rounded-top" style={{ height: "45%" }}></div>
                  <span className="small text-muted mt-2">Mar</span>
                </div>
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success-subtle rounded-top" style={{ height: "60%" }}></div>
                  <span className="small text-muted mt-2">Apr</span>
                </div>
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success-subtle rounded-top" style={{ height: "55%" }}></div>
                  <span className="small text-muted mt-2">May</span>
                </div>
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success-subtle rounded-top" style={{ height: "75%" }}></div>
                  <span className="small text-muted mt-2">Jun</span>
                </div>
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success-subtle rounded-top" style={{ height: "70%" }}></div>
                  <span className="small text-muted mt-2">Jul</span>
                </div>
                <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
                  <div className="w-100 bg-success rounded-top" style={{ height: "90%" }}></div>
                  <span className="small text-dark fw-bold mt-2">Aug</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0 text-dark">Financial Actions</h6>
            </div>
            <div className="card-body p-3 d-flex flex-column gap-2">
              <button className="btn btn-outline-secondary d-flex justify-content-between align-items-center py-2.5 text-start">
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-spreadsheet text-success"></i> Export General Ledger
                </span>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>
              <button className="btn btn-outline-secondary d-flex justify-content-between align-items-center py-2.5 text-start">
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-receipt text-primary"></i> Batch Generate Invoices
                </span>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>
              <button className="btn btn-outline-secondary d-flex justify-content-between align-items-center py-2.5 text-start">
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-counterclockwise text-danger"></i> Process Refund
                </span>
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>

              <div className="alert alert-success-subtle border-0 text-success-emphasis p-2.5 rounded mt-auto mb-0 small">
                <i className="bi bi-info-circle me-1"></i> Month-end audit reconciliation due in <strong>4 days</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
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
              placeholder="Search transaction ID or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select"
              style={{ minWidth: "170px" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Service Fee">Service Fee</option>
              <option value="Marketplace Sale">Marketplace Sale</option>
              <option value="Penalty / Fine">Penalty / Fine</option>
              <option value="Special Pickup">Special Pickup</option>
            </select>
            <select
              className="form-select"
              style={{ minWidth: "170px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Category</th>
                <th>Payer / Entity</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th className="text-end">Amount (LKR)</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setSelectedTransaction(item)} style={{ cursor: "pointer" }}>
                  <td>
                    <span className="fw-bold text-dark">{item.id}</span>
                  </td>
                  <td>
                    <span className={`badge bg-${typeBadgeColor[item.type]}-subtle text-${typeBadgeColor[item.type]}-emphasis`}>
                      {item.type}
                    </span>
                  </td>
                  <td>
                    <span className="fw-semibold">{item.payerEntity}</span>
                  </td>
                  <td className="small text-muted">{item.paymentMethod}</td>
                  <td className="small text-muted">{item.date}</td>
                  <td className="text-end fw-bold text-dark">
                    LKR {item.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge bg-${statusBadgeColor[item.status]}-subtle text-${statusBadgeColor[item.status]}-emphasis`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-light"
                      title="View Receipt"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(item);
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No transactions match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {transactions.length} entries
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Record Payment Entry</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Payment Category</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as Transaction["type"] })}
                    >
                      <option value="Service Fee">Service Fee</option>
                      <option value="Marketplace Sale">Marketplace Sale</option>
                      <option value="Penalty / Fine">Penalty / Fine</option>
                      <option value="Special Pickup">Special Pickup</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Payer Name / Business</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ceylon Logistics Ltd"
                      value={form.payerEntity}
                      onChange={(e) => setForm({ ...form, payerEntity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
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
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Payment Method</label>
                      <select
                        className="form-select"
                        value={form.paymentMethod}
                        onChange={(e) =>
                          setForm({ ...form, paymentMethod: e.target.value as Transaction["paymentMethod"] })
                        }
                      >
                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                        <option value="Online Banking">Online Banking</option>
                        <option value="Cash Deposit">Cash Deposit</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3">
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-white border-bottom">
                <div>
                  <span className="badge bg-success-subtle text-success-emphasis me-2">
                    {selectedTransaction.type}
                  </span>
                  <span className="fw-bold text-dark">{selectedTransaction.id}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedTransaction(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total Paid</span>
                  <h4 className="fw-bold text-success mb-0">LKR {selectedTransaction.amount.toLocaleString()}</h4>
                </div>
                <hr />
                <div className="row g-3">
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">Entity / Payer</span>
                    <span className="fw-semibold text-dark">{selectedTransaction.payerEntity}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">Status</span>
                    <span className={`badge bg-${statusBadgeColor[selectedTransaction.status]}-subtle text-${statusBadgeColor[selectedTransaction.status]}-emphasis`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">Date Recorded</span>
                    <span className="small text-dark">{selectedTransaction.date}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted text-uppercase fw-semibold d-block">Method</span>
                    <span className="small text-dark">{selectedTransaction.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedTransaction(null)}>
                  Close
                </button>
                <button type="button" className="btn btn-success btn-sm">
                  <i className="bi bi-printer me-1"></i> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsManagement;