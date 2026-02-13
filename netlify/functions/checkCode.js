const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const { code } = event.queryStringParameters;

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Code required" }),
      };
    }

    const { data: codeData, error: codeError } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single();

    if (codeError || !codeData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Invalid code" }),
      };
    }

    if (!codeData.is_active) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Code disabled" }),
      };
    }

    const { data: tierData } = await supabase
      .from("tiers")
      .select("*")
      .eq("id", codeData.tier_id)
      .single();

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", codeData.project_id)
      .single();

    const { data: subs } = await supabase
      .from("submissions")
      .select("id")
      .eq("code_id", codeData.id);

    const used = subs?.length || 0;
    const remaining = codeData.max_submissions - used;

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        community_name: codeData.community_name,
        tier_name: tierData?.name || "Unknown",
        max_submissions: codeData.max_submissions,
        used,
        remaining,
        project: {
          name: projectData?.name,
          slug: projectData?.slug,
          allow_duplicate_block: projectData?.allow_duplicate_block,
          allow_multi_chain: projectData?.allow_multi_chain,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
 
