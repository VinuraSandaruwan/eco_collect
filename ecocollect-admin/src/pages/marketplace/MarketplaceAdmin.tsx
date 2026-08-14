import { useState } from "react";

interface Listing {
  wasteType: string;
  icon: string;
  iconColor: string;
  quantity: string;
  price: string;
  buyerCategory: string;
  location: string;
  status: "Available" | "Reserved" | "Sold Out";
  dateAdded: string;
}

const initialListings: Listing[] = [
  {
    wasteType: "Organic Waste",
    icon: "bi-flower1",
    iconColor: "success",
    quantity: "12.5t",
    price: "LKR 45/t",
    buyerCategory: "Biogas Plants",
    location: "Sector A-12",
    status: "Available",
    dateAdded: "Oct 12, 2024",
  },
  {
    wasteType: "Plastic PET",
    icon: "bi-recycle",
    iconColor: "primary",
    quantity: "8.0t",
    price: "LKR 240/t",
    buyerCategory: "Plastic Recyclers",
    location: "Sector B-4",
    status: "Reserved",
    dateAdded: "Oct 10, 2024",
  },
  {
    wasteType: "E-Waste",
    icon: "bi-cpu",
    iconColor: "secondary",
    quantity: "1.2t",
    price: "LKR 1,800/t",
    buyerCategory: "E-Waste Processors",
    location: "Central Hub",
    status: "Sold Out",
    dateAdded: "Oct 08, 2024",
  },
  {
    wasteType: "Paper/Cardboard",
    icon: "bi-file-earmark-text",
    iconColor: "warning",
    quantity: "22.0t",
    price: "LKR 85/t",
    buyerCategory: "Paper Mills",
    location: "Sector D-1",
    status: "Available",
    dateAdded: "Oct 05, 2024",
  },
];

const statusBadge: Record<Listing["status"], string> = {
  Available: "success",
  Reserved: "warning",
  "Sold Out": "danger",
};

function MarketplaceAdmin() {
  const [listings] = useState<Listing[]>(initialListings);
  const [search, setSearch] = useState("");
  const [wasteTypeFilter, setWasteTypeFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");

  const filtered = listings.filter((item) => {
    const matchesSearch =
      item.wasteType.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesWasteType = wasteTypeFilter ? item.wasteType === wasteTypeFilter : true;
    const matchesBuyer = buyerFilter ? item.buyerCategory === buyerFilter : true;
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
            Manage secondary material listings and broker inventory.
          </p>
        </div>
        <button className="btn btn-success d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          Add New Listing
        </button>
      </div>

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-box-seam text-success"></i>
                Total Active Listings
              </div>
              <div className="fs-3 fw-bold">156</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-speedometer text-primary"></i>
                Total Quantity Available
              </div>
              <div className="fs-3 fw-bold">
                1,248 <span className="fs-6 text-muted fw-normal">Tons</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-hourglass-split text-danger"></i>
                Pending Buyer Requests
              </div>
              <div className="fs-3 fw-bold">12</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted small text-uppercase fw-semibold mb-2">
                <i className="bi bi-cash-coin text-success"></i>
                Revenue This Month
              </div>
              <div className="fs-3 fw-bold text-success">LKR 42,150</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        {/* Controls */}
        <div className="card-header bg-white d-flex flex-wrap gap-3 justify-content-between align-items-center py-3">
          <div className="position-relative" style={{ minWidth: "260px", flex: 1 }}>
            <i className="bi bi-search position-absolute text-muted" style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search listings by material or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select"
              style={{ minWidth: "170px" }}
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
            >
              <option value="">All Waste Types</option>
              <option value="Organic Waste">Organic Waste</option>
              <option value="Plastic PET">Plastic PET</option>
              <option value="E-Waste">E-Waste</option>
              <option value="Paper/Cardboard">Paper/Cardboard</option>
            </select>
            <select
              className="form-select"
              style={{ minWidth: "190px" }}
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
            >
              <option value="">All Buyer Categories</option>
              <option value="Biogas Plants">Biogas Plants</option>
              <option value="Plastic Recyclers">Plastic Recyclers</option>
              <option value="E-Waste Processors">E-Waste Processors</option>
              <option value="Paper Mills">Paper Mills</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Waste Type</th>
                <th className="text-end">Quantity</th>
                <th className="text-end">Price/Ton</th>
                <th>Buyer Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className={`d-flex align-items-center justify-content-center rounded-circle bg-${item.iconColor}-subtle text-${item.iconColor}`}
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <span className="fw-semibold">{item.wasteType}</span>
                    </div>
                  </td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">{item.price}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary-emphasis">
                      {item.buyerCategory}
                    </span>
                  </td>
                  <td className="small text-muted">{item.location}</td>
                  <td>
                    <span className={`badge bg-${statusBadge[item.status]}-subtle text-${statusBadge[item.status]}-emphasis`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="small text-muted">{item.dateAdded}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-light me-1" title="Edit">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-light text-danger" title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No listings match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="small text-muted">
            Showing {filtered.length} of {listings.length} listings
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceAdmin;