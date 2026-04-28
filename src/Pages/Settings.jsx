import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { signOut } from "../Services/auth";
import "../Dashboard.css";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState({
    shopName: "",
    phoneNumber: "",
    location: "",
    notes: "",
  });
  const [preferences, setPreferences] = useState({
    lowStockThreshold: "",
  });
  const [settingsMessage, setSettingsMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        navigate("/SignIn");
        return;
      }

      setUser(data.user);

      await loadUserSettings(data.user.id);
    }

    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/SignIn");
  };

  async function loadUserSettings(userId) {
    setSettingsLoading(true);

    const { data, error } = await supabase
      .from("user_settings")
      .select("shop_name, phone_number, location, notes, low_stock_threshold")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setSettingsMessage(error.message);
      setSettingsLoading(false);
      return;
    }

    if (data) {
      setShopSettings({
        shopName: data.shop_name || "",
        phoneNumber: data.phone_number || "",
        location: data.location || "",
        notes: data.notes || "",
      });

      setPreferences({
        lowStockThreshold:
          data.low_stock_threshold != null ? String(data.low_stock_threshold) : "",
      });
    }

    setSettingsLoading(false);
  }

  function handleShopSettingsChange(e) {
    const { name, value } = e.target;

    setShopSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePreferencesChange(e) {
    const { name, value } = e.target;

    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveShopSettings(e) {
    e.preventDefault();

    if (!user) return;

    setSettingsMessage("");

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        shop_name: shopSettings.shopName,
        phone_number: shopSettings.phoneNumber,
        location: shopSettings.location,
        notes: shopSettings.notes,
        low_stock_threshold: preferences.lowStockThreshold
          ? Number(preferences.lowStockThreshold)
          : null,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setSettingsMessage(error.message);
      return;
    }

    setSettingsMessage("Shop settings saved.");
  }

  async function savePreferences(e) {
    e.preventDefault();

    if (!user) return;

    setPreferencesMessage("");

    if (
      preferences.lowStockThreshold &&
      Number(preferences.lowStockThreshold) < 1
    ) {
      setPreferencesMessage("Low stock threshold must be 1 or more.");
      return;
    }

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        shop_name: shopSettings.shopName,
        phone_number: shopSettings.phoneNumber,
        location: shopSettings.location,
        notes: shopSettings.notes,
        low_stock_threshold: preferences.lowStockThreshold
          ? Number(preferences.lowStockThreshold)
          : null,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setPreferencesMessage(error.message);
      return;
    }

    setPreferencesMessage("Preferences saved.");
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="main">
        <div className="main-inner">
          <div className="page-header">
            <h1>Settings</h1>
            <p className="page-subtitle">
              Manage your account and application preferences.
            </p>
          </div>

          <div className="d-card">
            <h2>Account</h2>
            <p>
              <strong>Email:</strong> {settingsLoading ? "Loading..." : user?.email}
            </p>
          </div>

          <div className="d-card">
            <h2>Shop Settings</h2>

            <form className="drawer-form" onSubmit={saveShopSettings}>
              <input
                name="shopName"
                placeholder="Shop Name"
                value={shopSettings.shopName}
                onChange={handleShopSettingsChange}
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={shopSettings.phoneNumber}
                onChange={handleShopSettingsChange}
              />
              <input
                name="location"
                placeholder="Location"
                value={shopSettings.location}
                onChange={handleShopSettingsChange}
              />
              <textarea
                name="notes"
                placeholder="Notes"
                rows="3"
                value={shopSettings.notes}
                onChange={handleShopSettingsChange}
              />

              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </form>

            {settingsMessage && <p className="form-message">{settingsMessage}</p>}
          </div>

          <div className="d-card">
            <h2>Preferences</h2>

            <form className="drawer-form" onSubmit={savePreferences}>
              <input
                name="lowStockThreshold"
                type="number"
                min="1"
                placeholder="Low stock alert threshold (ex: 5)"
                value={preferences.lowStockThreshold}
                onChange={handlePreferencesChange}
              />

              <button type="submit" className="save-btn">
                Save Preferences
              </button>
            </form>

            {preferencesMessage && (
              <p className="form-message">{preferencesMessage}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}