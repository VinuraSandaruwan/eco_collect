import { useState, useEffect } from "react";
import type { ReportItem } from "../../types/database.types";
import { getReports, addReport, deleteReport } from "../../services/apiService";

const formatBadge: Record<ReportItem["format"], { bg: string; icon: string }> = {
  PDF: { bg: "danger", icon: "bi-filetype-pdf" },
  Excel: { bg: "success", icon: "bi-filetype-xlsx" },
  CSV: { bg: "primary", icon: "bi-filetype-csv" },
};

function ReportsManagement() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal form state
  const [form, setForm] = useState({
    name: "",
    category: "Audit" as ReportItem["category"],
    format: "PDF" as ReportItem["format"],
    dateRange: "Last 30 Days",
  });

  const fetchReportsList = async () => {
    setLoading(true);
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReportsList();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);

    const created = await addReport({
      name: form.name,
      category: form.category,
      format: form.format,
      date_generated: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      size: "2.4 MB",
      generated_by: "Admin User",
    });

    setReports((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      name: "",
      category: "Audit",
      format: "PDF",
      dateRange: "Last 30 Days",
    });
  };

  const handleDeleteReport = async (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    await deleteReport(id);
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? r.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Reports & Analytical Exports
          </h2>
          <p className="text-muted mb-0">
            Generate, download, and archive municipal waste audits, route performance, and financial statements.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-file-earmark-plus"></i>
          Generate Custom Report
        </button>
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
              placeholder="Search reports by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "170px" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Audit">Audit</option>
            <option value="Fleet & Routes">Fleet & Routes</option>
            <option value="Personnel">Personnel</option>
            <option value="Financial">Financial</option>
            <option value="Recycling">Recycling</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Report Title</th>
                <th>Category</th>
                <th>Format</th>
                <th>Date Generated</th>
                <th>File Size</th>
                <th>Author</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching reports archive from Supabase...
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold text-dark">{r.name}</div>
                      <div className="small text-muted">{r.id}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{r.category}</span>
                    </td>
                    <td>
                      <span className={`badge bg-${formatBadge[r.format]?.bg || "secondary"}-subtle text-${formatBadge[r.format]?.bg || "secondary"}-emphasis`}>
                        <i className={`bi ${formatBadge[r.format]?.icon} me-1`}></i>
                        {r.format}
                      </span>
                    </td>
                    <td className="small text-muted">{r.date_generated}</td>
                    <td className="small font-monospace">{r.size}</td>
                    <td className="small">{r.generated_by}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-light text-primary me-1" title="Download">
                        <i className="bi bi-download"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-light text-danger"
                        title="Delete Report"
                        onClick={() => handleDeleteReport(r.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No generated reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Generate Custom Audit Report</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleGenerateReport}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Report Document Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Q3 Fleet Efficiency Audit"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value as ReportItem["category"] })}
                      >
                        <option value="Audit">Audit</option>
                        <option value="Fleet & Routes">Fleet & Routes</option>
                        <option value="Personnel">Personnel</option>
                        <option value="Financial">Financial</option>
                        <option value="Recycling">Recycling</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Export Format</label>
                      <select
                        className="form-select"
                        value={form.format}
                        onChange={(e) => setForm({ ...form, format: e.target.value as ReportItem["format"] })}
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="Excel">Excel Spreadsheet</option>
                        <option value="CSV">CSV Data Export</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Generating..." : "Generate & Save Report"}
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

export default ReportsManagement;