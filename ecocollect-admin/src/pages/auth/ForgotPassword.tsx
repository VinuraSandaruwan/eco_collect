import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP sent to:", email);
    // Later connect backend API here
    navigate("/verify-otp");
  };

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "400px",
          borderRadius: "15px",
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        <h3 className="text-center mb-3">Forgot Password</h3>
        <p className="text-center text-muted">
          Enter your registered email address.
          <br />
          We'll send you a verification code.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            style={{ background: "#198754" }}
            type="submit"
            className="btn btn-primary w-100"
          >
            Send OTP
          </button>
        </form>
        <div className="text-center mt-3">
          <Link
            to="/login"
            style={{
              color: "#198754",
              textDecoration: "none",
            }}
          >
            Back to Login
          </Link>
        </div>
        <div className="text-center mt-4">
          <small className="text-muted">
            © Municipality Management System
          </small>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;