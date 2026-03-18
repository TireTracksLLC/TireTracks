import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTires, setRecentTires] = useState([]);
  const [addMsg, setAddMsg] = useState("");

  // Get user + recent tires
  useEffect(() => {
    getUser();
    fetchRecentTires();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
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

  // ADD TIRE
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

    if (size.length < 5) return setAddMsg("Invalid size");
    if (!condition) return setAddMsg("Pick condition");

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
    form.quantity.value = 1;

    fetchRecentTires(); // refresh list
  }

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>TireTracks</h2>

        <nav>
          <button>Dashboard</button>
          <button>Inventory</button>
        </nav>

        <div className="profile">
          <p>{user ? user.email : "Not signed in"}</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        <h1>Dashboard</h1>

        {/* RECENT TIRES */}
        <div className="card">
          <h2>Recent Inventory</h2>

          {recentTires.length === 0 ? (
            <p>No tires yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {recentTires.map((t) => (
                  <tr key={t.id}>
                    <td>{t.size}</td>
                    <td>{t.brand}</td>
                    <td>{t.model}</td>
                    <td>{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ADD TIRE */}
        <div className="card">
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

      </main>
    </div>
  );
}