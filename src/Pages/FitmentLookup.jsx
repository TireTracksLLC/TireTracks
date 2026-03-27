import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { signOut } from "../Services/auth";
import "../Dashboard.css";
import { lookupFitment } from "../Services/fitment";

export default function FitmentLookup() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    region: "usdm",
  });

  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selectedTrim, setSelectedTrim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/signin");
      return;
    }
    setUser(data.user);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResults([]);
    setMeta(null);
    setSelectedTrim(null);

    try {
      const data = await lookupFitment(form);
      setResults(data.data || []);
      setMeta(data.meta || null);

      if (!data.data || data.data.length === 0) {
        setMessage("No fitment results found.");
      }
    } catch (err) {
      console.error("Fitment lookup error:", err);
      setMessage(err.message || "Fitment lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function renderWheelRow(wheel, index) {
    const front = wheel.front || {};

    return (
      <tr key={index}>
        <td>{wheel.is_stock ? "Stock" : "Optional"}</td>
        <td>{front.rim || "-"}</td>
        <td>{front.tire_full || front.tire || "-"}</td>
        <td>{front.rim_offset != null ? `ET${front.rim_offset}` : "-"}</td>
        <td>{front.tire_pressure?.psi ? `${front.tire_pressure.psi} PSI` : "-"}</td>
      </tr>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">TireTracks</h2>

          <nav className="sidebar-nav">
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button className="nav-btn" onClick={() => navigate("/inventory")}>
              Inventory
            </button>
            <button
              className="nav-btn active"
              onClick={() => navigate("/fitment")}
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
              <h1>Fitment Lookup</h1>
              <p className="page-subtitle">
                Search vehicle wheel and tire fitment by make, model, year, and region.
              </p>
            </div>
          </div>

          <div className="d-card">
            <form className="fitment-form" onSubmit={handleSubmit}>
              <input
                name="make"
                placeholder="Make (ex: honda)"
                value={form.make}
                onChange={handleChange}
                required
              />

              <input
                name="model"
                placeholder="Model (ex: civic)"
                value={form.model}
                onChange={handleChange}
                required
              />

              <input
                name="year"
                type="number"
                placeholder="Year (ex: 2020)"
                value={form.year}
                onChange={handleChange}
                required
              />

              <select
                name="region"
                value={form.region}
                onChange={handleChange}
              >
                <option value="usdm">USDM</option>
                <option value="cdm">CDM</option>
                <option value="mxndm">MXNDM</option>
                <option value="ladm">LADM</option>
                <option value="eudm">EUDM</option>
                <option value="jdm">JDM</option>
                <option value="chdm">CHDM</option>
                <option value="medm">MEDM</option>
              </select>

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search Fitment"}
              </button>
            </form>

            {message && <p className="form-message">{message}</p>}
          </div>

          {results.length > 0 && (
            <>
              <div className="d-card">
                <div className="card-header">
                  <h2>Available Trims</h2>
                </div>

                <div className="trim-grid">
                  {results.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      className={`trim-card ${
                        selectedTrim?.slug === item.slug ? "selected" : ""
                      }`}
                      onClick={() => setSelectedTrim(item)}
                    >
                      <h3>{item.trim || item.name}</h3>
                      <p>
                        {item.make?.name} {item.model?.name}
                      </p>
                      <p>
                        {item.start_year} - {item.end_year}
                      </p>
                      <p>
                        {item.engine?.capacity}L {item.engine?.fuel}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {meta && (
                <div className="d-card">
                  <div className="card-header">
                    <h2>Search Summary</h2>
                  </div>
                  <p className="empty-text">
                    Found {meta.count} result{meta.count === 1 ? "" : "s"}.
                  </p>
                </div>
              )}
            </>
          )}

          {selectedTrim && (
            <>
              <div className="d-card">
                <div className="card-header">
                  <h2>Selected Trim Details</h2>
                </div>

                <div className="fitment-details-grid">
                  <div className="fitment-detail-box">
                    <strong>Trim</strong>
                    <span>{selectedTrim.trim || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Generation</strong>
                    <span>{selectedTrim.generation?.name || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Bolt Pattern</strong>
                    <span>{selectedTrim.technical?.bolt_pattern || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Center Bore</strong>
                    <span>{selectedTrim.technical?.centre_bore || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Stud Holes</strong>
                    <span>{selectedTrim.technical?.stud_holes || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>PCD</strong>
                    <span>{selectedTrim.technical?.pcd || "-"}</span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Thread Size</strong>
                    <span>
                      {selectedTrim.technical?.wheel_fasteners?.thread_size || "-"}
                    </span>
                  </div>

                  <div className="fitment-detail-box">
                    <strong>Torque</strong>
                    <span>
                      {selectedTrim.technical?.wheel_tightening_torque || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-card">
                <div className="card-header">
                  <h2>Wheel and Tire Sizes</h2>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Rim</th>
                        <th>Tire</th>
                        <th>Offset</th>
                        <th>Pressure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrim.wheels?.map(renderWheelRow)}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}