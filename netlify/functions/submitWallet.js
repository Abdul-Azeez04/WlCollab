const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const { wallet, code, chain } = JSON.parse(event.body);

    const { data: codeData, error: codeError } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single();

    if (codeError || !codeData || !codeData.is_active) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or inactive code" }),
      };
    }

    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("code_id", codeData.id);

    if (subs.length >= codeData.max_submissions) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Quota full for this code" }),
      };
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", codeData.project_id)
      .single();

    if (project.allow_duplicate_block) {
      const { data: dup } = await supabase
        .from("submissions")
        .select("*")
        .eq("project_id", codeData.project_id)
        .eq("wallet", wallet);

      if (dup.length > 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Duplicate wallet blocked" }),
        };
      }
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      project_id: codeData.project_id,
      code_id: codeData.id,
      tier_id: codeData.tier_id,
      wallet,
      chain,
    });

    if (insertError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save wallet" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Wallet submitted!" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
 
