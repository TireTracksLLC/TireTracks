export async function lookupFitment({ make, model, year, region = "usdm" }) {
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitment-lookup`;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!functionUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  try {
    const res = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        make: String(make).trim().toLowerCase(),
        model: String(model).trim().toLowerCase(),
        year: Number(year),
        region: String(region).trim().toLowerCase(),
      }),
    });

    const rawText = await res.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(rawText || `Invalid response (status ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(
        data.error ||
        data.details ||
        data.raw_response ||
        `Request failed with status ${res.status}`
      );
    }

    return data;

  } catch (err) {
    console.error("Fitment API error:", err);
    throw new Error(err.message || "Fitment lookup failed");
  }
}