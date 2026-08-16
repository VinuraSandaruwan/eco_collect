import { useState, useEffect } from "react";
import type { SystemSettings } from "../../types/database.types";
import { getSettings, updateSettings } from "../../services/apiService";

function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<"general" | "roles" | "notifications" | "api">("general");
  const [savedAlert, setSavedAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings Form State
  const [settings, setSettings] = useState<SystemSettings>({
    municipality_name: "Colombo Municipal Council",
    contact_email: "admin@colombo-waste.gov.lk",
    contact_phone: "+94 11 269 1111",
    timezone: "Asia/Colombo (UTC+05:30)",
    address: "Town Hall, Colombo 07, Sri Lanka",
    currency: "LKR (Rs.)",
    email_alerts: true,
    sms_dispatches: true,
    auto_notify_citizen: true,
    dumping_hotspot_alert: true,
    maintenance_alert: true,
    google_maps_api_key: "AIzaSyD-mock_google_maps_key_99214",
    sms_gateway_api_key: "mock_mobitel_dialog_sms_gateway_sec_key",
    gps_sync_interval: "30 seconds",
  });

  const fetchSystemSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
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
          <div className="alert alert-success py-1 px-3 mb-0 d-flex align-items-center gap-2 small shadow-sm">
            <i className="bi bi-check-circle-fill"></i> Settings updated in Supabase!
          </div>
        )}
      </div>

      {/* Main Settings Card with Left Nav Tabs */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="row g-0">
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
            {loading ? (
              <div className="text-center text-muted py-5">
                <div className="spinner-border spinner-border-sm text-success me-2"></div>
                Loading settings configuration...
              </div>
            ) : (
              <form onSubmit={handleSave}>
                {activeTab === "general" && (
                  <div>
                    <h5 className="fw-bold mb-4">Municipal Organization Details</h5>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Municipality / Authority Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.municipality_name}
                        onChange={(e) => setSettings({ ...settings, municipality_name: e.target.value })}
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Contact Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={settings.contact_email}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Contact Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settings.contact_phone}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Headquarters Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h5 className="fw-bold mb-4">Automated Alert System</h5>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.email_alerts}
                        onChange={(e) => setSettings({ ...settings, email_alerts: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold">Email Dispatch Alerts</label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.sms_dispatches}
                        onChange={(e) => setSettings({ ...settings, sms_dispatches: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold">SMS Dispatch & Citizen Reminders</label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.dumping_hotspot_alert}
                        onChange={(e) => setSettings({ ...settings, dumping_hotspot_alert: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold">Illegal Dumping Hotspot Alerts</label>
                    </div>
                  </div>
                )}

                {activeTab === "api" && (
                  <div>
                    <h5 className="fw-bold mb-4">API Gateways & Integrations</h5>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Google Maps API Key</label>
                      <input
                        type="password"
                        className="form-control"
                        value={settings.google_maps_api_key}
                        onChange={(e) => setSettings({ ...settings, google_maps_api_key: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">SMS Gateway Key</label>
                      <input
                        type="password"
                        className="form-control"
                        value={settings.sms_gateway_api_key}
                        onChange={(e) => setSettings({ ...settings, sms_gateway_api_key: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <button type="submit" className="btn btn-success px-4" disabled={saving}>
                    {saving ? "Saving Changes..." : "Save Settings"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsManagement;