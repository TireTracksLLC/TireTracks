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
  const [pendingQtyChange, setPendingQtyChange] = useState(null);

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

  function normalizeText(s) {
    const value = (s || "").trim().toLowerCase();
    return value === "" ? null : value;
  }

  function normalizeCondition(s) {
    return (s || "").trim().toLowerCase();
  }

  function formatText(s) {
    if (!s) return "-";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate("/SignIn");
      return;
    }
    setUser(data.user);
    await fetchTires(data.user.id);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/SignIn");
  };

  async function fetchTires(userId) {
    const currentUserId = userId || user?.id;
    if (!currentUserId) {
      setTires([]);
      return;
    }
    const { data, error } = await supabase
      .from("tires")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      return;
    }
    setTires(data || []);
  }

  async function handleQuantityChange(id, currentQuantity, amount) {
    setMessage("");
    const newQuantity = currentQuantity + amount;
    if (newQuantity < 1) {
      setMessage("Quantity cannot go below 1.");
      return;
    }
    setTires((prev) =>
      prev.map((t) => (t.id === id ? { ...t, quantity: newQuantity } : t))
    );
    const { error } = await supabase
      .from("tires")
      .update({ quantity: newQuantity })
      .eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Quantity updated.");
  }

  // Opens the custom modal for adding or removing tire quantities.
  function openQuantityModal(tire, type) {
    setMessage("");
    setPendingQtyChange({
      tire,
      type,
      amount: "",
    });
  }

  // Checks the entered amount, calculates the new quantity, and saves the update.
  async function confirmQuantityChange() {
    if (!pendingQtyChange) return;
    const amount = parseInt(pendingQtyChange.amount, 10);
    if (!Number.isInteger(amount) || amount < 1) {
      setMessage("Enter a valid amount.");
      return;
    }
    const changeAmount = pendingQtyChange.type === "add" ? amount : -amount;
    const newQuantity = pendingQtyChange.tire.quantity + changeAmount;
    if (newQuantity < 1) {
      setMessage("Quantity cannot go below 1.");
      return;
    }
    await handleQuantityChange(
      pendingQtyChange.tire.id,
      pendingQtyChange.tire.quantity,
      changeAmount
    );
    setPendingQtyChange(null);
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
    const brand = normalizeText(form.brand.value);
    const model = normalizeText(form.model.value);
    const condition = normalizeCondition(form.condition.value);
    const quantityToAdd = parseInt(form.quantity.value, 10);
    const priceRaw = form.price.value;
    const price = priceRaw === "" ? null : Number(priceRaw);
    if (size.length < 2) {
      setAddMsg("Enter a valid tire size.");
      return;
    }
    if (!condition || !["new", "used"].includes(condition)) {
      setAddMsg("Pick a valid condition.");
      return;
    }
    if (!Number.isInteger(quantityToAdd) || quantityToAdd < 1) {
      setAddMsg("Quantity must be 1 or more.");
      return;
    }
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      setAddMsg("Price must be valid.");
      return;
    }
    let query = supabase
      .from("tires")
      .select("*")
      .eq("user_id", user.id)
      .eq("size", size)
      .eq("condition", condition);
    if (brand === null) {
      query = query.is("brand", null);
    } else {
      query = query.eq("brand", brand);
    }
    if (model === null) {
      query = query.is("model", null);
    } else {
      query = query.eq("model", model);
    }
    if (price === null) {
      query = query.is("price", null);
    } else {
      query = query.eq("price", price);
    }
    const { data: existingRows, error: findError } = await query;
    if (findError) {
      setAddMsg(findError.message);
      return;
    }
    let existing = null;
    if (existingRows && existingRows.length > 0) {
      existing = existingRows[0];
      if (existingRows.length > 1) {
        const totalQty = existingRows.reduce(
          (sum, t) => sum + (t.quantity || 0),
          0
        );
        const { error: mergeError } = await supabase
          .from("tires")
          .update({ quantity: totalQty })
          .eq("id", existing.id);
        if (mergeError) {
          setAddMsg(mergeError.message);
          return;
        }
        const extraIds = existingRows.slice(1).map((t) => t.id);
        if (extraIds.length > 0) {
          const { error: deleteExtraError } = await supabase
            .from("tires")
            .delete()
            .in("id", extraIds);
          if (deleteExtraError) {
            setAddMsg(deleteExtraError.message);
            return;
          }
        }
        existing.quantity = totalQty;
      }
    }
    if (existing) {
      const newQuantity = (existing.quantity || 0) + quantityToAdd;
      const { error: updateError } = await supabase
        .from("tires")
        .update({ quantity: newQuantity })
        .eq("id", existing.id);
      if (updateError) {
        setAddMsg(updateError.message);
        return;
      }
      setAddMsg(`Updated quantity. New quantity: ${newQuantity}`);
    } else {
      const { error: insertError } = await supabase.from("tires").insert([
        {
          user_id: user.id,
          size,
          brand,
          model,
          condition,
          quantity: quantityToAdd,
          price,
        },
      ]);
      if (insertError) {
        setAddMsg(insertError.message);
        return;
      }
      setAddMsg("Saved!");
    }
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
    await fetchTires();
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

  const modalAmount = pendingQtyChange
    ? parseInt(pendingQtyChange.amount, 10)
    : 0;
  const modalAmountIsValid =
    pendingQtyChange && Number.isInteger(modalAmount) && modalAmount > 0;
  const modalPreviewQuantity =
    pendingQtyChange && modalAmountIsValid
      ? pendingQtyChange.type === "add"
        ? pendingQtyChange.tire.quantity + modalAmount
        : pendingQtyChange.tire.quantity - modalAmount
      : null;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">TireTracks</h2>
          <nav className="sidebar-nav">
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button
              className="nav-btn active"
              onClick={() => navigate("/inventory")}
            >
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
                  <button
                    type="button"
                    onClick={() => alert("Settings clicked")}
                  >
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTires.map((t) => (
                      <tr key={t.id}>
                        <td>{t.size}</td>
                        <td>{formatText(t.brand)}</td>
                        <td>{formatText(t.model)}</td>
                        <td>{formatText(t.condition)}</td>
                        <td>
                          <div className="qty-control">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => openQuantityModal(t, "remove")}
                            >
                              -
                            </button>
                            <span
                              className={`qty-number ${
                                t.quantity < 5 ? "low-stock" : ""
                              }`}
                            >
                              {t.quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => openQuantityModal(t, "add")}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{t.price != null ? `$${t.price}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {message && <p className="form-message">{message}</p>}
          {pendingQtyChange && (
            <div
              className="qty-modal-overlay"
              onClick={() => setPendingQtyChange(null)}
            >
              <div className="qty-modal" onClick={(e) => e.stopPropagation()}>
                <h2>
                  {pendingQtyChange.type === "add"
                    ? "Add Inventory"
                    : "Remove Inventory"}
                </h2>
                <p>
                  Current quantity: <strong>{pendingQtyChange.tire.quantity}</strong>
                </p>
                <label htmlFor="qty-change-input">
                  Amount to {pendingQtyChange.type === "add" ? "add" : "remove"}
                </label>
                <input
                  id="qty-change-input"
                  type="number"
                  min="1"
                  value={pendingQtyChange.amount}
                  onChange={(e) =>
                    setPendingQtyChange((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && modalAmountIsValid) {
                      confirmQuantityChange();
                    }
                    if (e.key === "Escape") {
                      setPendingQtyChange(null);
                    }
                  }}
                  autoFocus
                />
                {modalAmountIsValid && (
                  <p className="qty-preview">
                    New quantity will be <strong>{modalPreviewQuantity}</strong>
                  </p>
                )}
                <div className="qty-modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setPendingQtyChange(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={confirmQuantityChange}
                    disabled={!modalAmountIsValid}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
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
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                  <input
                    name="quantity"
                    type="number"
                    defaultValue="1"
                    min="1"
                  />
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                  />
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