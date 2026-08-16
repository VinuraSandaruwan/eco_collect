import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/apiService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(res.error || "Failed to authenticate");
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 40, 20, 0.65), rgba(0, 20, 10, 0.75)), url('/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#004b23",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <h3
              style={{
                color: "#997300",
                fontWeight: "700",
                fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Waste Management
            </h3>

            <p
              className="text-muted"
              style={{
                fontWeight: "600",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Municipal Administration Portal
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger py-2 small mb-3 text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small mb-1">
                Email Address
              </label>

              <div className="input-group">
                <span
                  className="input-group-text bg-light border-end-0"
                  style={{ borderColor: "#ced4da" }}
                >
                  <i className="bi bi-envelope-fill text-muted"></i>
                </span>

                <input
                  type="email"
                  className="form-control border-start-0 bg-light"
                  placeholder="admin@waste.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    fontSize: "15px",
                    boxShadow: "none",
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small mb-1">
                Password
              </label>

              <div className="input-group">
                <span
                  className="input-group-text bg-light border-end-0"
                  style={{ borderColor: "#ced4da" }}
                >
                  <i className="bi bi-lock-fill text-muted"></i>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control border-start-0 border-end-0 bg-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    fontSize: "15px",
                    boxShadow: "none",
                  }}
                />

                <span
                  className="input-group-text bg-light border-start-0"
                  style={{
                    borderColor: "#ced4da",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-fill text-muted"
                        : "bi bi-eye-slash-fill text-muted"
                    }
                  ></i>
                </span>
              </div>
            </div>

            <div className="text-end mb-4">
              <Link
                to="/forgot-password"
                className="text-decoration-none"
                style={{
                  color: "#856404",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn w-100 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{
                backgroundColor: "#198754",
                color: "white",
                fontWeight: "600",
                height: "45px",
                borderRadius: "8px",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <hr className="my-4 text-muted opacity-25" />

          <p
            className="text-center text-muted mb-0"
            style={{
              fontSize: "12px",
            }}
          >
            © {new Date().getFullYear()} Municipal Council. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;