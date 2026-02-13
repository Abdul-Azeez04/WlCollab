const { createClient } = require("@supabase/supabase-js");

// Supabase client (service role for writes)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse pasted wallets (newlines or commas)
function normalizeWallets(input) {
  if (!input) return [];
  return input
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { code, chain, wallets: rawWallets } = body;

    if (!code) return { statusCode: 400, body: JSON.stringify({ error: "Code required" }) };
    if (!chain) return { statusCode: 400, body: JSON.stringify({ error: "Chain required" }) };

    const wallets = Array.isArray(rawWallets)
      ? rawWallets.map(w => w.trim()).filter(Boolean)
      : normalizeWallets(rawWallets);

    if (wallets.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "No wallets submitted" }) };

    // 1️⃣ Fetch code
    const { data: codeData } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single();

    if (!codeData || !codeData.is_active)
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid or inactive code" }) };

    // 2️⃣ Fetch project
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", codeData.project_id)
      .single();

    if (!project)
      return { statusCode: 400, body: JSON.stringify({ error: "Project not found" }) };

    // 3️⃣ Check quota
    const { data: existingSubs } = await supabase
      .from("submissions")
      .select("id")
      .eq("code_id", codeData.id);

    const currentCount = existingSubs?.length || 0;
    const remaining = codeData.max_submissions - currentCount;
    if (remaining <= 0)
      return { statusCode: 400, body: JSON.stringify({ error: "Quota full" }) };

    // 4️⃣ Duplicate check
    let existingProjectWallets = [];
    if (project.allow_duplicate_block) {
      const { data: projectSubs } = await supabase
        .from("submissions")
        .select("wallet")
        .eq("project_id", project.id);
      existingProjectWallets = (projectSubs || []).map((w) => w.wallet.toLowerCase());
    }

    // 5️⃣ Validate wallets
    const accepted = [];
    const rejected = [];

    for (let w of wallets) {
      if (accepted.length >= remaining) {
        rejected.push({ wallet: w, reason: "Quota exceeded" });
        continue;
      }
      if (project.allow_duplicate_block && existingProjectWallets.includes(w.toLowerCase())) {
        rejected.push({ wallet: w, reason: "Duplicate blocked" });
        continue;
      }
      accepted.push(w);
    }

    if (accepted.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "No wallets accepted", rejected }) };

    // 6️⃣ Insert accepted wallets
    const insertPayload = accepted.map((wallet) => ({
      project_id: project.id,
      code_id: codeData.id,
      tier_id: codeData.tier_id,
      wallet,
      chain,
    }));

    const { error: insertError } = await supabase.from("submissions").insert(insertPayload);
    if (insertError)
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to save wallets" }) };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `${accepted.length} wallet(s) submitted successfully`,
        accepted,
        rejected,
        remaining: remaining - accepted.length,
        tier_name: project.tier_name || "N/A",
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", details: err.message }) };
  }
};
