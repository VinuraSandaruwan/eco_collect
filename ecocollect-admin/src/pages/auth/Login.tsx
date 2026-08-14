import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "100%",
          maxWidth: "400px",
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

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small mb-1">
                Email
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
                  placeholder="Enter email"
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
                  placeholder="Enter your password"
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
              className="btn w-100 shadow-sm"
              style={{
                backgroundColor: "#198754",
                color: "white",
                fontWeight: "600",
                height: "45px",
                borderRadius: "8px",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Login
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