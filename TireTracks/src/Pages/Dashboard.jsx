import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import '../Dashboard.css'
import { getUser } from "../Services/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTires, setRecentTires] = useState([]);
  const [addMsg, setAddMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const navigate = useNavigate();


  useEffect(() => {
    getUser();
    fetchRecentTires();
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

    if (!error) setRecentTires(data);
  }

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, "");
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddMsg("");

    if (!user) {
      setAddMsg("You must be signed in.");
      return;
    }

    const form = e.target;

    const size = normalizeSize(form.size.value);
    const brand = form.brand.value.trim();
    const model = form.model.value.trim();
    const condition = form.condition.value;
    const quantity = parseInt(form.quantity.value, 10);
    const priceRaw = form.price.value;

    if (size.length < 5) {
      setAddMsg("Invalid size");
      return;
    }

    if (!condition) {
      setAddMsg("Pick condition");
      return;
    }

    const price = priceRaw === "" ? null : Number(priceRaw);

    const { error } = await supabase.from("tires").insert([
      {
        user_id: user.id,
        size,
        brand: brand || null,
        model: model || null,
        condition,
        quantity,
        price,
      },
    ]);

    if (error) {
      setAddMsg(error.message);
      return;
    }

    setAddMsg("Saved!");
    form.reset();
    form.quantity.value = 1;
    fetchRecentTires();
  }

  const handleNavClick = (page) => {
    setActiveNav(page);       // update active button
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
          <h1>Dashboard</h1>

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
        </div>
      </main>
    </div>
  );
}