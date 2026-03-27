import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";
import { lookupFitment } from "../Services/fitment";
import "../Dashboard.css";

export default function Inventory() {
  const [user, setUser] = useState(null);
  const [tires, setTires] = useState([]);
  const [searchSize, setSearchSize] = useState("");
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [fitmentForm, setFitmentForm] = useState({
    make: "",
    model: "",
    year: "",
    region: "usdm",
  });
  const [fitmentLoading, setFitmentLoading] = useState(false);
  const [fitmentMessage, setFitmentMessage] = useState("");
  const [fitmentResults, setFitmentResults] = useState([]);
  const [selectedFitment, setSelectedFitment] = useState(null);

  const navigate = useNavigate();

  function normalizeSize(s) {
    return (s || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  useEffect(() => {
    getUser();
    fetchTires();
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

  async function fetchTires() {
    const { data, error } = await supabase
      .from("tires")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTires(data || []);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("tires").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Deleted!");
    fetchTires();
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

    setFitmentForm({
      make: "",
      model: "",
      year: "",
      region: "usdm",
    });
    setFitmentResults([]);
    setSelectedFitment(null);
    setFitmentMessage("");

    fetchTires();
    setShowAdd(false);
  }

  async function handleFitmentLookup() {
    setFitmentLoading(true);
    setFitmentMessage("");
    setFitmentResults([]);
    setSelectedFitment(null);

    try {
      const data = await lookupFitment(fitmentForm);
      const results = data.data || [];

      setFitmentResults(results);

      if (results.length === 0) {
        setFitmentMessage("No fitment results found.");
      }
    } catch (err) {
      setFitmentMessage(err.message || "Fitment lookup failed");
    } finally {
      setFitmentLoading(false);
    }
  }

  function applyFitmentToForm(item) {
    setSelectedFitment(item);

    const stockWheel =
      item.wheels?.find((w) => w.is_stock && w.front?.tire) ||
      item.wheels?.find((w) => w.front?.tire);

    if (!stockWheel?.front?.tire) {
      setFitmentMessage("No tire size available on that trim.");
      return;
    }

    const sizeInput = document.querySelector('input[name="size"]');
    if (sizeInput) {
      sizeInput.value = stockWheel.front.tire;
    }

    setFitmentMessage(
      `Applied ${stockWheel.front.tire} from ${item.trim || item.name}.`
    );
  }

  const filteredTires = tires.filter((t) =>
    normalizeSize(t.size).includes(normalizeSize(searchSize))
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">TireTracks</h2>

          <nav className="sidebar-nav">
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button className="nav-btn active" onClick={() => navigate("/inventory")}>
              Inventory
            </button>
            <button className="nav-btn" onClick={() => navigate("/fitment")}>
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
              <h1>Inventory</h1>
              <p className="page-subtitle">
                Manage your tire inventory and search by size.
              </p>
            </div>

            <button className="primary-btn" onClick={() => setShowAdd(true)}>
              + Add Tire
            </button>
          </div>

          <div className="d-card search-card">
            <input
              className="search-input"
              placeholder="Search by size (ex: 225/65R17)"
              value={searchSize}
              onChange={(e) => setSearchSize(e.target.value)}
            />
          </div>

          <div className="d-card">
            <div className="card-header">
              <h2>All Inventory</h2>
            </div>

            {filteredTires.length === 0 ? (
              <p className="empty-text">No tires found</p>
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
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTires.map((t) => (
                      <tr key={t.id}>
                        <td>{t.size}</td>
                        <td>{t.brand || "-"}</td>
                        <td>{t.model || "-"}</td>
                        <td>{t.condition}</td>
                        <td>{t.quantity}</td>
                        <td>{t.price != null ? `$${t.price}` : "-"}</td>
                        <td>
                          <button
                            className="danger-btn"
                            onClick={() => handleDelete(t.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {message && <p className="form-message">{message}</p>}

          {showAdd && (
            <div className="add-panel">
              <div className="add-panel-content">
                <button
                  className="close-btn"
                  onClick={() => setShowAdd(false)}
                  type="button"
                >
                  ✕
                </button>

                <h2>Add Tire</h2>

                <div className="inventory-fitment-box">
                  <h3>Optional Vehicle Fitment Lookup</h3>

                  <div className="inventory-fitment-form">
                    <input
                      placeholder="Make"
                      value={fitmentForm.make}
                      onChange={(e) =>
                        setFitmentForm((prev) => ({
                          ...prev,
                          make: e.target.value,
                        }))
                      }
                    />

                    <input
                      placeholder="Model"
                      value={fitmentForm.model}
                      onChange={(e) =>
                        setFitmentForm((prev) => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="number"
                      placeholder="Year"
                      value={fitmentForm.year}
                      onChange={(e) =>
                        setFitmentForm((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                    />

                    <select
                      value={fitmentForm.region}
                      onChange={(e) =>
                        setFitmentForm((prev) => ({
                          ...prev,
                          region: e.target.value,
                        }))
                      }
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

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleFitmentLookup}
                      disabled={fitmentLoading}
                    >
                      {fitmentLoading ? "Searching..." : "Get Fitment"}
                    </button>
                  </div>

                  {fitmentMessage && (
                    <p className="form-message">{fitmentMessage}</p>
                  )}

                  {fitmentResults.length > 0 && (
                    <div className="trim-grid inventory-trim-grid">
                      {fitmentResults.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          className={`trim-card ${
                            selectedFitment?.slug === item.slug ? "selected" : ""
                          }`}
                          onClick={() => applyFitmentToForm(item)}
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
                  )}

                  {selectedFitment && (
                    <div className="fitment-preview">
                      <p>
                        <strong>Bolt Pattern:</strong>{" "}
                        {selectedFitment.technical?.bolt_pattern || "-"}
                      </p>
                      <p>
                        <strong>Center Bore:</strong>{" "}
                        {selectedFitment.technical?.centre_bore || "-"}
                      </p>
                    </div>
                  )}
                </div>

                <form className="drawer-form" onSubmit={handleAdd}>
                  <input name="size" placeholder="Size" required />
                  <input name="brand" placeholder="Brand" />
                  <input name="model" placeholder="Model" />

                  <select name="condition" required>
                    <option value="">Condition...</option>
                    <option>New</option>
                    <option>Used</option>
                  </select>

                  <input name="quantity" type="number" defaultValue="1" min="1" />
                  <input name="price" type="number" placeholder="Price" />

                  <button className="save-btn" type="submit">
                    Save
                  </button>
                </form>

                {addMsg && <p className="form-message">{addMsg}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}