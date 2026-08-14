import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

function AdminLayout() {
  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div
        className="flex-grow-1 d-flex flex-column overflow-auto"
        style={{
          height: "100vh",
        }}
      >
        <Navbar />
        <main
          className="p-4 flex-grow-1"
          style={{
            background: "#f8f9fa",
          }}
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AdminLayout;