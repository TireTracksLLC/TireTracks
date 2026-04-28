import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "../Dashboard.css";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function getThemeColor(variableName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTires, setRecentTires] = useState([]);
  const [allTires, setAllTires] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      navigate("/SignIn");
      return;
    }

    setUser(data.user);
    await fetchRecentTires(data.user.id);
    await fetchAllTires(data.user.id);
  }

  async function fetchRecentTires(userId) {
    setRecentLoading(true);

    const { data, error } = await supabase
      .from("tires")
      .select("id, size, brand, model, condition, quantity, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent tires:", error);
      setRecentLoading(false);
      return;
    }

    setRecentTires(data || []);
    setRecentLoading(false);
  }

  async function fetchAllTires(userId) {
    setInsightsLoading(true);

    const { data, error } = await supabase
      .from("tires")
      .select("id, size, brand, model, quantity, price")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching all tires:", error);
      setInsightsLoading(false);
      return;
    }

    setAllTires(data || []);
    setInsightsLoading(false);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/SignIn");
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

  const themeColors = {
    primary: getThemeColor("--primary-red"),
    primaryDark: getThemeColor("--primary-red-dark"),
    primarySoft: getThemeColor("--primary-red-soft"),
    dark: getThemeColor("--dark"),
    white: getThemeColor("--white"),
    grid: "rgba(17, 24, 39, 0.08)",
  };

  const sortedSizes = Object.entries(sizeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const sortedModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalTires = allTires.reduce(
    (sum, tire) => sum + (Number(tire.quantity) || 0),
    0
  );

  const uniqueSizes = Object.keys(sizeCounts).length;

  const lowStockItems = allTires.filter(
    (tire) => (Number(tire.quantity) || 0) < 5
  ).length;

  const totalInventoryValue = allTires.reduce((sum, tire) => {
    const quantity = Number(tire.quantity) || 0;
    const price = Number(tire.price) || 0;
    return sum + quantity * price;
  }, 0);

  const topSizeChartData = {
    labels: sortedSizes.map(([size]) => size),
    datasets: [
      {
        label: "Top Tire Sizes",
        data: sortedSizes.map(([, qty]) => qty),
        backgroundColor: themeColors.primary,
        borderRadius: 8,
      },
    ],
  };

  const modelChartData = {
    labels: sortedModels.map(([model]) => model),
    datasets: [
      {
        label: "Top Models",
        data: sortedModels.map(([, qty]) => qty),
        backgroundColor: themeColors.primary,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: themeColors.dark,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: themeColors.dark,
        },
        grid: {
          color: themeColors.grid,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: themeColors.dark,
        },
        grid: {
          color: themeColors.grid,
        },
      },
    },
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
                  <button type="button" onClick={() => navigate("/settings")}>
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

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Tires</h3>
              <p>{totalTires}</p>
            </div>

            <div className="stat-card">
              <h3>Unique Sizes</h3>
              <p>{uniqueSizes}</p>
            </div>

            <div className="stat-card">
              <h3>Low Stock Items</h3>
              <p>{lowStockItems}</p>
            </div>

            <div className="stat-card">
              <h3>Total Value</h3>
              <p>
                {totalInventoryValue.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
            </div>
          </div>

          <div className="d-card">
            <div className="card-header">
              <h2>Recent Inventory</h2>
            </div>

            {recentLoading ? (
              <p className="empty-text">Loading recent inventory...</p>
            ) : recentTires.length === 0 ? (
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

            {insightsLoading ? (
              <p className="empty-text">Loading inventory insights...</p>
            ) : allTires.length === 0 ? (
              <p className="empty-text">Add inventory to see charts.</p>
            ) : (
              <div className="chart-grid">
                <div className="chart-box">
                  <h3>Top Sizes</h3>
                  <Bar data={topSizeChartData} options={barChartOptions} />
                </div>

                <div className="chart-box">
                  <h3>Top Models</h3>
                  <Bar data={modelChartData} options={barChartOptions} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}