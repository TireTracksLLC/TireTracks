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
  const [allTires, setAllTires] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    getUser();
    fetchRecentTires();
    fetchAllTires();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      navigate("/signin");
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

    if (error) {
      console.error("Error fetching recent tires:", error);
      return;
    }

    setRecentTires(data || []);
  }

  async function fetchAllTires() {
    const { data, error } = await supabase
      .from("tires")
      .select("*");

    if (error) {
      console.error("Error fetching all tires:", error);
      return;
    }

    setAllTires(data || []);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const handleNavClick = (page) => {
    setActiveNav(page);

    if (page === "Dashboard") {
      navigate("/dashboard");
    } else if (page === "Inventory") {
      navigate("/inventory");
    } else if (page === "Fitment Lookup") {
      navigate("/fitment");
    }
  };

  const sizeCounts = {};
  const modelCounts = {};

  allTires.forEach((tire) => {
    const size = tire.size || "Unknown";
    const model = tire.model || "Unknown";
    const qty = Number(tire.quantity) || 0;

    sizeCounts[size] = (sizeCounts[size] || 0) + qty;
    modelCounts[model] = (modelCounts[model] || 0) + qty;
  });

  const sizeChartData = {
    labels: Object.keys(sizeCounts),
    datasets: [
      {
        label: "Tires by Size",
        data: Object.values(sizeCounts),
        backgroundColor: [
          "#a30000",
          "#c51515",
          "#df4a38",
          "#f28c7f",
          "#8b0000",
          "#5c0000",
        ],
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const modelChartData = {
    labels: Object.keys(modelCounts),
    datasets: [
      {
        label: "Tires by Model",
        data: Object.values(modelCounts),
        backgroundColor: [
          "#a30000",
          "#b80f0f",
          "#c51515",
          "#8b0000",
          "#df4a38",
          "#5c0000",
        ],
        borderWidth: 0,
      },
    ],
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

            <button
              className={`nav-btn ${activeNav === "Fitment Lookup" ? "active" : ""}`}
              onClick={() => handleNavClick("Fitment Lookup")}
            >
              Fitment Lookup
            </button>
          </nav>
        </div>

        <div className="profile">
          {user ? (
            <div className="dropdown">
              <button
                className="dropdown-button"
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
            <h1>Dashboard</h1>
            <p className="page-subtitle">
              Overview of your most recently added inventory.
            </p>
          </div>

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
                    {recentTires.map((tire) => (
                      <tr key={tire.id}>
                        <td>{tire.size}</td>
                        <td>{tire.brand || "-"}</td>
                        <td>{tire.model || "-"}</td>
                        <td>{tire.condition || "-"}</td>
                        <td>{tire.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="d-card">
            <div className="card-header">
              <h2>Inventory Insights</h2>
            </div>

            {allTires.length === 0 ? (
              <p className="empty-text">Add inventory to see charts.</p>
            ) : (
              <div className="chart-grid">
                <div className="chart-box">
                  <h3>Size Distribution</h3>
                  <Pie data={sizeChartData} />
                </div>

                <div className="chart-box">
                  <h3>Model Distribution</h3>
                  <Bar
                    data={modelChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: {
                            color: "#ffffff",
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: "#ffffff",
                          },
                          grid: {
                            color: "rgba(255,255,255,0.08)",
                          },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: "#ffffff",
                          },
                          grid: {
                            color: "rgba(255,255,255,0.08)",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}