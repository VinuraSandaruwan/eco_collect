import { useState, useEffect } from "react";
import type { MarketplaceListing } from "../../types/database.types";
import { getMarketplaceListings, addMarketplaceListing, deleteMarketplaceListing } from "../../services/apiService";

const wasteMeta: Record<string, { icon: string; iconColor: string; defaultBuyer: string }> = {
  "Organic Waste": { icon: "bi-flower1", iconColor: "success", defaultBuyer: "Biogas Plants" },
  "Plastic PET": { icon: "bi-recycle", iconColor: "primary", defaultBuyer: "Plastic Recyclers" },
  "E-Waste": { icon: "bi-cpu", iconColor: "secondary", defaultBuyer: "E-Waste Processors" },
  "Paper/Cardboard": { icon: "bi-file-earmark-text", iconColor: "warning", defaultBuyer: "Paper Mills" },
  "Metal / Scrap Iron": { icon: "bi-tools", iconColor: "dark", defaultBuyer: "Foundries & Smelters" },
  "Glass Cullet": { icon: "bi-cup-straw", iconColor: "info", defaultBuyer: "Glass Manufacturers" },
};

const statusBadge: Record<MarketplaceListing["status"], string> = {
  Available: "success",
  Reserved: "warning",
  "Sold Out": "danger",
};

function MarketplaceAdmin() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wasteTypeFilter, setWasteTypeFilter] = useState("");
  const [buyerFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Adding New Listing
  const [form, setForm] = useState({
    wasteType: "Organic Waste",
    quantityValue: "",
    pricePerTon: "",
    buyerCategory: "Biogas Plants",
    location: "",
    status: "Available" as MarketplaceListing["status"],
  });

  const fetchListings = async () => {
    setLoading(true);
    const data = await getMarketplaceListings();
    setListings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleWasteTypeChange = (type: string) => {
    const defaultBuyer = wasteMeta[type]?.defaultBuyer || "Recyclers";
    setForm({
      ...form,
      wasteType: type,
      buyerCategory: defaultBuyer,
    });
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quantityValue || !form.pricePerTon || !form.location) return;
    setSubmitting(true);

    const meta = wasteMeta[form.wasteType] || { icon: "bi-recycle", iconColor: "success" };

    const created = await addMarketplaceListing({
      waste_type: form.wasteType,
      icon: meta.icon,
      icon_color: meta.iconColor,
      quantity: `${form.quantityValue}t`,
      price: `LKR ${form.pricePerTon}/t`,
      buyer_category: form.buyerCategory,
      location: form.location,
      status: form.status,
      date_added: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    });

    setListings((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
    setShowModal(false);
    setSubmitting(false);
    setForm({
      wasteType: "Organic Waste",
      quantityValue: "",
      pricePerTon: "",
      buyerCategory: "Biogas Plants",
      location: "",
      status: "Available",
    });
  };

  const handleDeleteListing = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    await deleteMarketplaceListing(id);
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.waste_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.location && l.location.toLowerCase().includes(search.toLowerCase())) ||
      (l.buyer_category && l.buyer_category.toLowerCase().includes(search.toLowerCase()));
    const matchesWasteType = wasteTypeFilter ? l.waste_type === wasteTypeFilter : true;
    const matchesBuyer = buyerFilter ? l.buyer_category === buyerFilter : true;
    return matchesSearch && matchesWasteType && matchesBuyer;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#000000" }}>
            Marketplace
          </h2>
          <p className="text-muted mb-0">
            Publish, audit, and sell recovered recyclable waste to verified industrial buyers.
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Publish Material Batch
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Total Listings</div>
              <div className="fs-3 fw-bold">{loading ? "..." : listings.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Available Stocks</div>
              <div className="fs-3 fw-bold text-success">
                {loading ? "..." : listings.filter((l) => l.status === "Available").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Reserved Batches</div>
              <div className="fs-3 fw-bold text-warning">
                {loading ? "..." : listings.filter((l) => l.status === "Reserved").length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Sold Out</div>
              <div className="fs-3 fw-bold text-danger">
                {loading ? "..." : listings.filter((l) => l.status === "Sold Out").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table Card */}
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
              placeholder="Search by waste category, location, or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ minWidth: "170px" }}
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
          >
            <option value="">All Material Types</option>
            <option value="Organic Waste">Organic Waste</option>
            <option value="Plastic PET">Plastic PET</option>
            <option value="E-Waste">E-Waste</option>
            <option value="Paper/Cardboard">Paper/Cardboard</option>
            <option value="Metal / Scrap Iron">Metal / Scrap Iron</option>
            <option value="Glass Cullet">Glass Cullet</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Material Type</th>
                <th>Quantity</th>
                <th>Asking Price</th>
                <th>Target Buyer Industry</th>
                <th>Depot Location</th>
                <th>Date Listed</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    Fetching marketplace inventory from Supabase...
                  </td>
                </tr>
              ) : (
                filteredListings.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`d-flex align-items-center justify-content-center rounded bg-${l.icon_color || "success"}-subtle text-${l.icon_color || "success"}`}
                          style={{ width: "34px", height: "34px" }}
                        >
                          <i className={`bi ${l.icon || "bi-recycle"}`}></i>
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{l.waste_type}</div>
                          <div className="small text-muted">{l.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-bold">{l.quantity}</td>
                    <td className="text-success fw-semibold">{l.price}</td>
                    <td className="small">{l.buyer_category}</td>
                    <td className="small text-muted">{l.location}</td>
                    <td className="small text-muted">{l.date_added}</td>
                    <td>
                      <span className={`badge bg-${statusBadge[l.status] || "secondary"}-subtle text-${statusBadge[l.status] || "secondary"}-emphasis`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light text-danger"
                        title="Delete Listing"
                        onClick={() => handleDeleteListing(l.id!)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredListings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No marketplace listings match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Listing Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Publish Recovered Material Batch</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handlePublishListing}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Material Type</label>
                    <select
                      className="form-select"
                      value={form.wasteType}
                      onChange={(e) => handleWasteTypeChange(e.target.value)}
                    >
                      <option value="Organic Waste">Organic Waste</option>
                      <option value="Plastic PET">Plastic PET</option>
                      <option value="E-Waste">E-Waste</option>
                      <option value="Paper/Cardboard">Paper/Cardboard</option>
                      <option value="Metal / Scrap Iron">Metal / Scrap Iron</option>
                      <option value="Glass Cullet">Glass Cullet</option>
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Quantity (Tons)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="e.g. 15.0"
                        value={form.quantityValue}
                        onChange={(e) => setForm({ ...form, quantityValue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Asking Price per Ton (LKR)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 120"
                        value={form.pricePerTon}
                        onChange={(e) => setForm({ ...form, pricePerTon: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Depot / Storage Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sector C-4 Sorting Yard"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Batch"}
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

export default MarketplaceAdmin;