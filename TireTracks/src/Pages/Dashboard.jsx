import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import '../Dashboard.css'
import { getUser } from "../Services/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTires, setRecentTires] = useState([]);
  const [addMsg, setAddMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);


  useEffect(() => {
    getUser();
    fetchRecentTires();
  }, []);

  
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

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">TireTracks</h2>

          <nav className="sidebar-nav">
            <button className="nav-btn active" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button className="nav-btn" onClick={() => navigate("/inventory")}>
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

          <div className="d-card">
            <div className="card-header">
              <h2>Add Tire</h2>
            </div>

            <form className="tire-form" onSubmit={handleAdd}>
              <input name="size" placeholder="Size" required />
              <input name="brand" placeholder="Brand" />
              <input name="model" placeholder="Model" />

              <select name="condition" required defaultValue="">
                <option value="" disabled>
                  Condition
                </option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>

              <input name="quantity" type="number" defaultValue="1" min="1" />
              <input name="price" type="number" placeholder="Price" step="0.01" min="0" />

              <button className="save-btn" type="submit">
                Save
              </button>
            </form>

            {addMsg && <p className="form-message">{addMsg}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}