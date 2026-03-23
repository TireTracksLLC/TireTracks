import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

export default function Inventory() {
  const [user, setUser] = useState(null);
  const [tires, setTires] = useState([]);
  const [searchSize, setSearchSize] = useState("");
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const navigate = useNavigate();

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, "");
  }

  useEffect(() => {
    getUser();
    fetchTires();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/SignIn");
      return;
    }
    setUser(data.user);
  }
  // SEARCH TIRE
  async function fetchTires() {
    const { data, error } = await supabase
      .from("tires")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTires(data);
  }

  // DELETE TIRE
  async function handleDelete(id) {
    const { error } = await supabase
      .from("tires")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Deleted!");
    fetchTires();
  }

  // ADD TIRE 
  async function handleAdd(e) {
    e.preventDefault();
    setAddMsg("");

    const form = e.target;

    const size = normalizeSize(form.size.value);
    const brand = form.brand.value.trim();
    const model = form.model.value.trim();
    const condition = form.condition.value;
    const quantity = parseInt(form.quantity.value, 10);
    const priceRaw = form.price.value;

    const price = priceRaw === "" ? null : Number(priceRaw);

    const { error } = await supabase.from("tires").insert([{
      user_id: user.id,
      size,
      brand: brand || null,
      model: model || null,
      condition,
      quantity,
      price,
    }]);

    if (error) {
      setAddMsg(error.message);
      return;
    }

    setAddMsg("Saved!");
    form.reset();
    fetchTires();
    setShowAdd(false);
  }

  const filteredTires = tires.filter((t) =>
    normalizeSize(t.size).includes(normalizeSize(searchSize))
  );

  return (
    <div className="dashboard">

      {/* sidebar */}
      <aside className="sidebar">
        <h2>TireTracks</h2>

        <nav>
          <button onClick={() => navigate("/Dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/inventory")}>Inventory</button>
        </nav>
      </aside>

      {/* main */}
      <main className="main">
        <h1>Inventory</h1>

        {/* ADD BUTTON */}
        <button onClick={() => setShowAdd(true)}>
          + Add Tire
        </button>

        {/* SEARCH */}
        <div className="d-card">
          <input
            placeholder="Search by size (ex: 225/65R17)"
            value={searchSize}
            onChange={(e) => setSearchSize(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="d-card">
          <h2>All Inventory</h2>

          {filteredTires.length === 0 ? (
            <p>No tires found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Condition</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredTires.map((t) => (
                  <tr key={t.id}>
                    <td>{t.size}</td>
                    <td>{t.brand}</td>
                    <td>{t.model}</td>
                    <td>{t.condition}</td>
                    <td>{t.quantity}</td>
                    <td>{t.price}</td>
                    <td>
                      <button onClick={() => handleDelete(t.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {message && <p>{message}</p>}

        {/* SLIDE PANEL */}
        {showAdd && (
          <div className="add-panel">
            <div className="add-panel-content">

              <button className="close-btn" onClick={() => setShowAdd(false)}>
                ✕
              </button>

              <h2>Add Tire</h2>

              <form onSubmit={handleAdd}>
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

                <button type="submit">Save</button>
              </form>

              <p>{addMsg}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}