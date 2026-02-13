<button
  onClick={() => {
    const filteredSubs = submissions.filter(s => s.code_id === c.id);
    if (!filteredSubs.length) return alert("No submissions for this code");

    const rows = filteredSubs.map(s => ({
      wallet: s.wallet,
      chain: s.chain,
      tier: getTierName(s.tier_id),
      code: c.code,
      created_at: s.created_at,
    }));

    const csvHeader = Object.keys(rows[0]).join(",");
    const csvBody = rows.map(r => Object.values(r).join(",")).join("\n");
    const csv = csvHeader + "\n" + csvBody;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}_${c.code}_submissions.csv`;
    a.click();
  }}
  className="bg-green-700 text-white px-4 py-2 rounded"
>
  Export Wallets Only
</button>
