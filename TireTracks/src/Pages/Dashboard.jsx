<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TireTracks</title>
        <div class="card">
  <h2>Add Tire</h2>
  <form id="addTireForm">
    <input id="size" placeholder="Size (ex: 225/65R17)" required />
    <input id="brand" placeholder="Brand (optional)" />
    <input id="model" placeholder="Model (optional)" />
    <select id="condition" required>
      <option value="">Condition...</option>
      <option>New</option>
      <option>Used</option>
    </select>
    <input id="quantity" type="number" min="1" value="1" required />
    <input id="price" type="number" min="0" step="0.01" placeholder="Price (optional)" />
    <button class="button-style" type="submit">Save to Inventory</button>
  </form>
  <p id="addMsg"></p>
</div>

<div class="card">
  <h2>Lookup Tire Availability</h2>
  <form id="searchForm">
    <input id="searchSize" placeholder="Search by size (ex: 225/65R17)" required />
    <button class="button-style" type="submit">Search</button>
  </form>

  <div id="results"></div>
</div>

        <link rel="stylesheet" href="styles.css">  
    </head>
    <body>
        <div class="top-bar">
            <button id="signinbutton" class="button-style">Sign In</button>
            <button id="signupbutton" class="button-style">Sign Up</button>
        </div>

        <h1>TireTracks</h1>
        <p>Make tracking your tires easy!</p>

        <p>Tire Tracks LLC</p>   
        <img src="images/tiretracksphoto.jpg" alt="TireTracks logo">
    </body>

</html>
<script type="module">
  import { supabase } from "./supabaseClient.js";

  const addForm = document.getElementById("addTireForm");
  const addMsg = document.getElementById("addMsg");

  const searchForm = document.getElementById("searchForm");
  const results = document.getElementById("results");

  function setMsg(el, text, ok=false) {
    el.style.color = ok ? "green" : "red";
    el.textContent = text;
  }

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, "");
  }

  //Insert tire
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addMsg.textContent = "";

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMsg(addMsg, "You must be signed in to add inventory.");

    const size = normalizeSize(document.getElementById("size").value);
    const brand = document.getElementById("brand").value.trim();
    const model = document.getElementById("model").value.trim();
    const condition = document.getElementById("condition").value;
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    const priceRaw = document.getElementById("price").value;

    //Simple validation
    if (size.length < 5) return setMsg(addMsg, "Enter a valid tire size (ex: 225/65R17).");
    if (!condition) return setMsg(addMsg, "Pick a condition.");
    if (!Number.isInteger(quantity) || quantity < 1) return setMsg(addMsg, "Quantity must be 1 or more.");

    const price = priceRaw === "" ? null : Number(priceRaw);
    if (price !== null && (Number.isNaN(price) || price < 0)) return setMsg(addMsg, "Price must be a valid number.");

    const { error } = await supabase.from("tires").insert([{
      user_id: user.id,
      size,
      brand: brand || null,
      model: model || null,
      condition,
      quantity,
      price,
    }]);

    if (error) return setMsg(addMsg, error.message);

    setMsg(addMsg, "Saved to inventory!", true);
    addForm.reset();
    document.getElementById("quantity").value = 1;
  });

  //Search tires by size
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerHTML = "";

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      results.innerHTML = "<p style='color:crimson;'>Sign in to search your inventory.</p>";
      return;
    }

    const searchSize = normalizeSize(document.getElementById("searchSize").value);
    if (searchSize.length < 5) {
      results.innerHTML = "<p style='color:crimson;'>Enter a valid size (ex: 225/65R17).</p>";
      return;
    }

    const { data, error } = await supabase
      .from("tires")
      .select("id,size,brand,model,condition,quantity,price,created_at")
      .eq("size", searchSize)
      .order("created_at", { ascending: false });

    if (error) {
      results.innerHTML = `<p style="color:crimson;">${error.message}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      results.innerHTML = "<p><b>Not available</b> (no matching tires found).</p>";
      return;
    }

    const totalQty = data.reduce((sum, t) => sum + (t.quantity ?? 0), 0);

    results.innerHTML = `
      <p><b>Available:</b> Yes — Total quantity: <b>${totalQty}</b></p>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left">Size</th>
            <th align="left">Brand</th>
            <th align="left">Model</th>
            <th align="left">Condition</th>
            <th align="left">Qty</th>
            <th align="left">Price</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(t => `
            <tr>
              <td>${t.size}</td>
              <td>${t.brand ?? ""}</td>
              <td>${t.model ?? ""}</td>
              <td>${t.condition}</td>
              <td>${t.quantity}</td>
              <td>${t.price ?? ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  });
</script>

