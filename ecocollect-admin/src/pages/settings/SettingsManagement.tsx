import { useState } from "react";

function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<"general" | "roles" | "notifications" | "api">("general");
  const [savedAlert, setSavedAlert] = useState(false);

  // General Settings Form
  const [generalForm, setGeneralForm] = useState({
    municipalityName: "Colombo Municipal Council",
    contactEmail: "admin@colombo-waste.gov.lk",
    contactPhone: "+94 11 269 1111",
    timezone: "Asia/Colombo (UTC+05:30)",
    address: "Town Hall, Colombo 07, Sri Lanka",
    currency: "LKR (Rs.)",
  });

  // Notification Settings Form
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsDispatches: true,
    autoNotifyCitizenOnResolution: true,
    dumpingHotspotAlert: true,
    maintenanceAlert: true,
  });

  // API & IoT Settings Form
  const [apiKeys, setApiKeys] = useState({
    googleMapsApiKey: "AIzaSyD-mock_google_maps_key_99214",
    smsGatewayApiKey: "mock_mobitel_dialog_sms_gateway_sec_key",
    gpsSyncInterval: "30 seconds",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#030303" }}>
            System Settings
          </h2>
          <p className="text-muted mb-0">
            Manage global municipal configurations, employee permissions, automated alerts, and API gateways.
          </p>
        </div>
        {savedAlert && (
          <div className="alert alert-success py-1 px-3 mb-0 d-flex align-items-center gap-2 small shadow-sm animate__animated animate__fadeIn">
            <i className="bi bi-check-circle-fill"></i> Settings updated successfully!
          </div>
        )}
      </div>

      {/* Main Settings Card with Left Nav Tabs */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="row g-0 min-vh-50">
          {/* Settings Left Tab Menu */}
          <div className="col-md-3 bg-light border-end p-3">
            <div className="nav flex-column nav-pills gap-1">
              <button
                className={`nav-link text-start py-2.5 px-3 fw-semibold ${
                  activeTab === "general" ? "active bg-success text-white" : "text-dark"
                }`}
                onClick={() => setActiveTab("general")}
              >
                <i className="bi bi-sliders me-2"></i> General Configuration
              </button>
              <button
                className={`nav-link text-start py-2.5 px-3 fw-semibold ${
                  activeTab === "roles" ? "active bg-success text-white" : "text-dark"
                }`}
                onClick={() => setActiveTab("roles")}
              >
                <i className="bi bi-shield-lock me-2"></i> Roles & Permissions
              </button>
              <button
                className={`nav-link text-start py-2.5 px-3 fw-semibold ${
                  activeTab === "notifications" ? "active bg-success text-white" : "text-dark"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell me-2"></i> Notification Triggers
              </button>
              <button
                className={`nav-link text-start py-2.5 px-3 fw-semibold ${
                  activeTab === "api" ? "active bg-success text-white" : "text-dark"
                }`}
                onClick={() => setActiveTab("api")}
              >
                <i className="bi bi-cpu me-2"></i> API & GPS Integrations
              </button>
            </div>
          </div>

          {/* Settings Content Body */}
          <div className="col-md-9 p-4 p-md-5">
            <form onSubmit={handleSave}>
              {/* ================= TAB 1: GENERAL ================= */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <h5 className="fw-bold border-bottom pb-2 text-dark">General Information</h5>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Municipality Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={generalForm.municipalityName}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, municipalityName: e.target.value })
                        }
                        required
                      />
                      <div className="form-text">Displayed on citizen app and exports.</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Official Contact Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={generalForm.contactEmail}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, contactEmail: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        System Timezone
                      </label>
                      <select
                        className="form-select"
                        value={generalForm.timezone}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, timezone: e.target.value })
                        }
                      >
                        <option value="Asia/Colombo (UTC+05:30)">Asia/Colombo (UTC+05:30)</option>
                        <option value="UTC">UTC Universal</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Local Currency Format
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={generalForm.currency}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, currency: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Headquarters Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.address}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* ================= TAB 2: ROLES & PERMISSIONS ================= */}
              {activeTab === "roles" && (
                <div>
                  <h5 className="fw-bold border-bottom pb-2 text-dark">Access Control Levels</h5>
                  <p className="small text-muted mb-4">
                    Configure staff permissions across the administrative web portal and collector applications.
                  </p>

                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr className="small text-uppercase">
                          <th>Role</th>
                          <th>Dashboard</th>
                          <th>Fleet Control</th>
                          <th>Resolve Issues</th>
                          <th>Financials</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Super Administrator</td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Operations Supervisor</td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                          <td><span className="badge bg-secondary">View Only</span></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Finance & Audit Officer</td>
                          <td><span className="badge bg-secondary">View Only</span></td>
                          <td><span className="badge bg-light text-muted border">None</span></td>
                          <td><span className="badge bg-light text-muted border">None</span></td>
                          <td><span className="badge bg-success">Full</span></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Driver / Field Collector</td>
                          <td><span className="badge bg-light text-muted border">None</span></td>
                          <td><span className="badge bg-info">Mobile GPS</span></td>
                          <td><span className="badge bg-info">Status Update</span></td>
                          <td><span className="badge bg-light text-muted border">None</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: NOTIFICATIONS ================= */}
              {activeTab === "notifications" && (
                <div>
                  <h5 className="fw-bold border-bottom pb-2 text-dark">Automated Alert Rules</h5>
                  <p className="small text-muted mb-4">
                    Enable or disable automated push messages and citizen notifications.
                  </p>

                  <div className="d-flex flex-column gap-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.autoNotifyCitizenOnResolution}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            autoNotifyCitizenOnResolution: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-semibold text-dark">
                        Automated Citizen Complaint Updates
                      </label>
                      <div className="small text-muted">
                        Trigger automated mobile push alerts when a reported missed pickup is marked resolved.
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.dumpingHotspotAlert}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            dumpingHotspotAlert: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-semibold text-dark">
                        Urgent Illegal Dumping Alerts
                      </label>
                      <div className="small text-muted">
                        Notify council field inspectors immediately when hazardous chemical or road blockage dumping is reported.
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.maintenanceAlert}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            maintenanceAlert: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-semibold text-dark">
                        Fleet Vehicle Maintenance Warnings
                      </label>
                      <div className="small text-muted">
                        Alert logistics manager when collection vehicles are flagged with mechanical defects.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: API & INTEGRATIONS ================= */}
              {activeTab === "api" && (
                <div>
                  <h5 className="fw-bold border-bottom pb-2 text-dark">Third-Party Gateway Keys</h5>
                  <p className="small text-muted mb-4">
                    Configure Google Maps GPS tracking APIs, cloud databases, and SMS verification endpoints.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Google Maps & Geocoding API Key
                    </label>
                    <input
                      type="password"
                      className="form-control font-monospace"
                      value={apiKeys.googleMapsApiKey}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, googleMapsApiKey: e.target.value })
                      }
                    />
                    <div className="form-text">Required for live vehicle telemetry and illegal dumping mapping.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      National SMS Gateway Auth Token
                    </label>
                    <input
                      type="password"
                      className="form-control font-monospace"
                      value={apiKeys.smsGatewayApiKey}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, smsGatewayApiKey: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      GPS Polling Telemetry Frequency
                    </label>
                    <select
                      className="form-select"
                      value={apiKeys.gpsSyncInterval}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, gpsSyncInterval: e.target.value })
                      }
                    >
                      <option value="15 seconds">15 seconds (High Accuracy)</option>
                      <option value="30 seconds">30 seconds (Recommended)</option>
                      <option value="60 seconds">60 seconds (Standard)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form Submit Footer */}
              <div className="pt-4 mt-4 border-top d-flex justify-content-end">
                <button type="submit" className="btn btn-success px-4 shadow-sm">
                  <i className="bi bi-floppy me-1"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsManagement;