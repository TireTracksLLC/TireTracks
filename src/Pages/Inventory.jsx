import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";
import "../Dashboard.css";

export default function Inventory() {
  const [user, setUser] = useState(null);
  const [tires, setTires] = useState([]);
  const [searchSize, setSearchSize] = useState("");
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    fetchTires();
    setShowAdd(false);
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
            <button
              className="nav-btn"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="nav-btn active"
              onClick={() => navigate("/inventory")}
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