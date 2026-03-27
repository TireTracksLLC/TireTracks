import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "../Dashboard.css";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTires, setRecentTires] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const navigate = useNavigate();
  const [allTires, setAllTires] = useState([]);
  

  useEffect(() => {
    getUser();
    fetchRecentTires();
    fetchAllTires();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/SignIn");
  };

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/SignIn");
      return;
    }
    setUser(data.user);
  }

  async function fetchRecentTires() {
    const { data, error } = await supabase
      .from("tires")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error) setRecentTires(data || []);
  }

  async function fetchAllTires() {
    const { data, error } = await supabase
      .from("tires")
      .select("*");

    if (!error) setAllTires(data || []);
  }


  const handleNavClick = (page) => {
    setActiveNav(page);
    navigate(page === "Dashboard" ? "/dashboard" : "/inventory");
  };

  return (
  <div className="dashboard">
    <aside className="sidebar">
      <div className="sidebar-top">
        <h2 className="logo">TireTracks</h2>

          <nav className="sidebar-nav">
            <button
              className={`nav-btn ${activeNav === "Dashboard" ? "active" : ""}`}
              onClick={() => handleNavClick("Dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${activeNav === "Inventory" ? "active" : ""}`}
              onClick={() => handleNavClick("Inventory")}
            >
              Inventory
            </button>
          </nav>
        </div>

      <div className="profile">
        {user ? (
          <div className="dropdown">
            <button
              className="dropdown-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
            >
              {user.email}
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button type="button" onClick={() => alert("Settings clicked")}>
                  Settings
                </button>
                <button type="button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </aside>

    <main className="main">
      <div className="main-inner">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">
              Overview of your most recently added inventory.
            </p>
          </div>
        </div>

        {/* RECENT INVENTORY */}
        <div className="d-card">
          <div className="card-header">
            <h2>Recent Inventory</h2>
          </div>

          {recentTires.length === 0 ? (
            <p className="empty-text">No tires yet</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Condition</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTires.map((t) => (
                    <tr key={t.id}>
                      <td>{t.size}</td>
                      <td>{t.brand || "-"}</td>
                      <td>{t.model || "-"}</td>
                      <td>{t.condition}</td>
                      <td>{t.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHARTS */}
        <div className="d-card">
          <div className="card-header">
            <h2>Inventory Insights</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* PIE CHART */}
            <div>
              <h3 style={{ textAlign: "center" }}>Size Distribution</h3>
              <Pie data={sizeChartData} />
            </div>

            {/* BAR CHART */}
            <div>
              <h3 style={{ textAlign: "center" }}>Model Distribution</h3>
              <Bar data={modelChartData} />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
}