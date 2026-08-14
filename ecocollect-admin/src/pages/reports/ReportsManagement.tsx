import { useState } from "react";

interface ReportItem {
  id: string;
  name: string;
  category: "Audit" | "Fleet & Routes" | "Personnel" | "Financial" | "Recycling";
  format: "PDF" | "Excel" | "CSV";
  dateGenerated: string;
  size: string;
  generatedBy: string;
}

const initialReports: ReportItem[] = [
  {
    id: "REP-2026-081",
    name: "Q3 FY26 Comprehensive Waste & Landfill Audit",
    category: "Audit",
    format: "PDF",
    dateGenerated: "Aug 14, 2026",
    size: "4.8 MB",
    generatedBy: "Admin Sarah Johnson",
  },
  {
    id: "REP-2026-082",
    name: "August Vehicle Route Efficiency & Fuel Consumption",
    category: "Fleet & Routes",
    format: "Excel",
    dateGenerated: "Aug 12, 2026",
    size: "2.1 MB",
    generatedBy: "Logistics Dept",
  },
  {
    id: "REP-2026-083",
    name: "Collector Crew Attendance & Shift Breakdown",
    category: "Personnel",
    format: "PDF",
    dateGenerated: "Aug 10, 2026",
    size: "1.4 MB",
    generatedBy: "Operations Desk",
  },
  {
    id: "REP-2026-084",
    name: "Recycling Circular Marketplace Revenue Summary",
    category: "Financial",
    format: "Excel",
    dateGenerated: "Aug 05, 2026",
    size: "3.2 MB",
    generatedBy: "Finance Division",
  },
  {
    id: "REP-2026-085",
    name: "Illegal Dumping Hotspot Resolution Log (Ward 1-6)",
    category: "Recycling",
    format: "CSV",
    dateGenerated: "Aug 01, 2026",
    size: "860 KB",
    generatedBy: "Environmental Protection Desk",
  },
];

const formatBadge: Record<ReportItem["format"], { bg: string; icon: string }> = {
  PDF: { bg: "danger", icon: "bi-filetype-pdf" },
  Excel: { bg: "success", icon: "bi-filetype-xlsx" },
  CSV: { bg: "primary", icon: "bi-filetype-csv" },
};

function ReportsManagement() {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Modal form state
  const [form, setForm] = useState({
    name: "",
    category: "Audit" as ReportItem["category"],
    format: "PDF" as ReportItem["format"],
    dateRange: "Last 30 Days",
  });

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const newReport: ReportItem = {
      id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      category: form.category,
      format: form.format,
      dateGenerated: "Aug 14, 2026",
      size: "1.8 MB",
      generatedBy: "Admin User",
    };

    setReports([newReport, ...reports]);
    setShowModal(false);
    setForm({
      name: "",
      category: "Audit",
      format: "PDF",
      dateRange: "Last 30 Days",
    });
  };

  const filtered = reports.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Performance & Analytical Reports
          </h2>
          <p className="text-muted mb-0">
            Review operational metrics, generate compliance audits, and download official municipal documents.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Generate Custom Report
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-trash3 text-success"></i>
                Total Waste Collected
              </div>
              <div className="fs-3 fw-bold">142,500 <span className="fs-6 text-muted fw-normal">Tons</span></div>
              <div className="small text-success mt-1">
                <i className="bi bi-arrow-up-short"></i> +4.2% from last quarter
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-speedometer2 text-primary"></i>
                Collection Efficiency
              </div>
              <div className="fs-3 fw-bold text-primary">94.8%</div>
              <div className="small text-success mt-1">
                <i className="bi bi-arrow-up-short"></i> +1.5% route optimization
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-cash-stack text-success"></i>
                Operational Cost / Ton
              </div>
              <div className="fs-3 fw-bold text-success">LKR 4,850</div>
              <div className="small text-success mt-1">
                <i className="bi bi-arrow-down-short"></i> -2.1% fuel savings
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-emoji-smile text-warning"></i>
                Citizen Satisfaction
              </div>
              <div className="fs-3 fw-bold text-dark">4.7 <span className="fs-6 text-muted fw-normal">/ 5.0</span></div>
              <div className="small text-muted mt-1">Based on 1,420 ratings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Trend Visual Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <div>
            <h6 className="fw-bold mb-0 text-dark">Waste Collection Volume vs Projected Targets</h6>
            <span className="small text-muted">Comparative tonnage across municipal sectors</span>
          </div>
          <div className="d-flex gap-3 small text-muted">
            <span className="d-flex align-items-center gap-1">
              <span className="badge bg-success rounded-circle p-1"> </span> Actual Collection
            </span>
            <span className="d-flex align-items-center gap-1">
              <span className="badge bg-secondary rounded-circle p-1"> </span> Municipal Target
            </span>
          </div>
        </div>
        <div className="card-body p-4" style={{ height: "220px" }}>
          <div className="d-flex align-items-end justify-content-between h-100 gap-3 border-bottom pb-2">
            <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
              <div className="w-100 bg-success-subtle rounded-top" style={{ height: "55%" }}></div>
              <span className="small text-muted mt-2">Q1 (Jan-Mar)</span>
            </div>
            <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
              <div className="w-100 bg-success-subtle rounded-top" style={{ height: "70%" }}></div>
              <span className="small text-muted mt-2">Q2 (Apr-Jun)</span>
            </div>
            <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
              <div className="w-100 bg-success rounded-top" style={{ height: "85%" }}></div>
              <span className="small text-dark fw-bold mt-2">Q3 (Jul-Sep)</span>
            </div>
            <div className="text-center flex-1 d-flex flex-column align-items-center justify-content-end h-100">
              <div className="w-100 bg-light border border-secondary border-dashed rounded-top" style={{ height: "90%" }}></div>
              <span className="small text-muted mt-2">Q4 (Forecast)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports Table */}
      <div className="card shadow-sm border-0">
        {/* Table Controls */}
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
          <div className="d-flex gap-2 flex-wrap">
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
                <th>Generated By</th>
                <th>File Size</th>
                <th className="text-end">Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold text-dark">{item.name}</div>
                    <div className="small text-muted">{item.id}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${formatBadge[item.format].bg}-subtle text-${formatBadge[item.format].bg}-emphasis d-inline-flex align-items-center gap-1`}>
                      <i className={`bi ${formatBadge[item.format].icon}`}></i>
                      {item.format}
                    </span>
                  </td>
                  <td className="small text-muted">{item.dateGenerated}</td>
                  <td className="small text-dark fw-medium">{item.generatedBy}</td>
                  <td className="small text-muted">{item.size}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-success" title="Download Report">
                      <i className="bi bi-download me-1"></i> Export
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No reports match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {reports.length} generated documents
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Generate Custom Report</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleGenerateReport}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Report Title / Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Monthly Sector 4 Organic Waste Summary"
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
                        <option value="PDF">PDF Document (.pdf)</option>
                        <option value="Excel">Excel Spreadsheet (.xlsx)</option>
                        <option value="CSV">Raw CSV (.csv)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Date Range</label>
                    <select
                      className="form-select"
                      value={form.dateRange}
                      onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
                    >
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                      <option value="Current Quarter (Q3)">Current Quarter (Q3)</option>
                      <option value="Year to Date (2026)">Year to Date (2026)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3">
                    Generate & Download
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