import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Password reset successful");
    navigate("/reset-success");
  };

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
          backgroundColor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="card-body p-4 p-sm-5">
          <h3 className="text-center mb-2">Reset Password</h3>

          <p className="text-center text-muted mb-4">
            Create your new password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small mb-1">
                New Password
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
                  placeholder="Enter new password"
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

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small mb-1">
                Confirm Password
              </label>

              <div className="input-group">
                <span
                  className="input-group-text bg-light border-end-0"
                  style={{ borderColor: "#ced4da" }}
                >
                  <i className="bi bi-lock-fill text-muted"></i>
                </span>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control border-start-0 border-end-0 bg-light"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "bi bi-eye-fill text-muted"
                        : "bi bi-eye-slash-fill text-muted"
                    }
                  ></i>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 shadow-sm"
              style={{
                background: "#198754",
                color: "white",
                fontWeight: "600",
                height: "45px",
                borderRadius: "8px",
              }}
            >
              Reset Password
            </button>
          </form>

          <div className="text-center mt-3">
            <Link
              to="/login"
              style={{
                color: "#198754",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Back to Login
            </Link>
          </div>

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

export default ResetPassword;