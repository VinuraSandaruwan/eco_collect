import { Link } from "react-router-dom";

function ResetSuccess() {
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
        }}
      >
        <div className="card-body p-4 p-sm-5">
          <div className="text-center">
            <i
              className="bi bi-check-circle-fill"
              style={{
                fontSize: "60px",
                color: "#198754",
              }}
            ></i>
            <h3
              className="mt-3"
              style={{
                fontWeight: "700",
              }}
            >
              Password Changed Successfully
            </h3>
            <p className="text-muted">
              Your password has been updated successfully.
            </p>
          </div>
          <Link
            to="/login"
            className="btn w-100 mt-3"
            style={{
              background: "#198754",
              color: "white",
              fontWeight: "600",
              height: "45px",
            }}
          >
            Go to Login
          </Link>
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

export default ResetSuccess;