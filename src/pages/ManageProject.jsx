import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function ManageProject() {
  const { slug } = useParams();

  const [project, setProject] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [newTierName, setNewTierName] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [maxSubmissions, setMaxSubmissions] = useState(0);

  const loadAll = async () => {
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();
    setProject(projectData);
    if (!projectData) return;

    const { data: tierData } = await supabase
      .from("tiers")
      .select("*")
      .eq("project_id", projectData.id)
      .order("created_at", { ascending: true });
    setTiers(tierData || []);

    const { data: codeData } = await supabase
      .from("codes")
      .select("*")
      .eq("project_id", projectData.id)
      .order("created_at", { ascending: false });
    setCodes(codeData || []);

    const { data: subData } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectData.id);
    setSubmissions(subData || []);
  };

  useEffect(() => {
    loadAll();
  }, [slug]);

  const createTier = async () => {
    if (!newTierName.trim()) return alert("Tier name required");
    const { error } = await supabase.from("tiers").insert({
      project_id: project.id,
      name: newTierName,
    });
    if (error) return alert(error.message);
    setNewTierName("");
    loadAll();
  };

  const createCommunityCode = async () => {
    if (!communityName.trim()) return alert("Community name required");
    if (!selectedTier) return alert("Select a tier");

    const code = generateCode() + generateCode();

    const { error } = await supabase.from("codes").insert({
      project_id: project.id,
      tier_id: selectedTier,
      community_name: communityName,
      code,
      max_submissions: Number(maxSubmissions),
      is_active: true,
    });

    if (error) return alert(error.message);
    setCommunityName("");
    setMaxSubmissions(0);
    loadAll();
  };

  const toggleCode = async (codeRow) => {
    const { error } = await supabase
      .from("codes")
      .update({ is_active: !codeRow.is_active })
      .eq("id", codeRow.id);
    if (error) return alert(error.message);
    loadAll();
  };

  const deleteCode = async (id) => {
    if (!confirm("Delete this code?")) return;
    const { error } = await supabase.from("codes").delete().eq("id", id);
    if (error) return alert(error.message);
    loadAll();
  };

  const exportCSV = async () => {
    if (!submissions || submissions.length === 0) return alert("No submissions yet!");
    const rows = submissions.map((s) => ({
      wallet: s.wallet,
      chain: s.chain,
      tier_id: s.tier_id,
      code_id: s.code_id,
      created_at: s.created_at,
    }));
    const csvHeader = Object.keys(rows[0]).join(",");
    const csvBody = rows.map((r) => Object.values(r).join(",")).join("\n");
    const csv = csvHeader + "\n" + csvBody;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}_submissions.csv`;
    a.click();
  };

  if (!project) return <div className="p-6">Loading...</div>;

  const getTierName = (tierId) => {
    const t = tiers.find((x) => x.id === tierId);
    return t ? t.name : "Unknown Tier";
  };

  const countSubmissionsForCode = (codeId) => {
    return submissions.filter((s) => s.code_id === codeId).length;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600">{project.slug}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/project/${project.slug}`}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Public Page
          </Link>

          <button
            onClick={exportCSV}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Create Tier */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-3">Allowlist Tiers</h2>
        <div className="flex gap-2 mb-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Tier name (Allowlist 1, FCFS, GTD etc.)"
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
          />
          <button
            onClick={createTier}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Tier
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          {tiers.map((t) => (
            <div key={t.id} className="border rounded p-2 bg-gray-50">
              {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* Create Community Code */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-3">Generate Community Code</h2>
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Community / CM name"
          value={communityName}
          onChange={(e) => setCommunityName(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full mb-2"
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
        >
          <option value="">Select Tier</option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          className="border p-2 rounded w-full mb-2"
          type="number"
          placeholder="Max wallets allowed (GTD/FCFS allocation)"
          value={maxSubmissions}
          onChange={(e) => setMaxSubmissions(e.target.value)}
        />
        <button
          onClick={createCommunityCode}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Generate Code
        </button>
      </div>

      {/* Codes Table with Copy / Toggle / Delete */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Community Codes</h2>

          <button
            onClick={() => {
              if (!submissions || submissions.length === 0) return alert("No submissions yet!");
              const rows = submissions.map((s) => ({
                wallet: s.wallet,
                chain: s.chain,
                created_at: s.created_at,
              }));
              const csvHeader = Object.keys(rows[0]).join(",");
              const csvBody = rows.map((r) => Object.values(r).join(",")).join("\n");
              const csv = csvHeader + "\n" + csvBody;

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${slug}_wallets_only.csv`;
              a.click();
            }}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Export Wallets Only
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Community</th>
                <th className="border p-2">Tier</th>
                <th className="border p-2">Code</th>
                <th className="border p-2">Quota</th>
                <th className="border p-2">Submitted</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const submitted = countSubmissionsForCode(c.id);
                return (
                  <tr key={c.id}>
                    <td className="border p-2">{c.community_name}</td>
                    <td className="border p-2">{getTierName(c.tier_id)}</td>
                    <td className="border p-2 font-mono">{c.code}</td>
                    <td className="border p-2">{c.max_submissions}</td>
                    <td className="border p-2">{submitted} / {c.max_submissions}</td>
                    <td className="border p-2">
                      {c.is_active ? (
                        <span className="text-green-600 font-bold">ACTIVE</span>
                      ) : (
                        <span className="text-red-600 font-bold">DISABLED</span>
                      )}
                    </td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          alert("Code copied!");
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Copy
                      </button>

                      <button
                        onClick={() => toggleCode(c)}
                        className="bg-gray-200 px-2 py-1 rounded"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => deleteCode(c.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {codes.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No codes created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
