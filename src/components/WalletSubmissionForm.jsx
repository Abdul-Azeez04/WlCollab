import { useState, useEffect } from "react";

export default function WalletSubmissionForm() {
  const [walletInput, setWalletInput] = useState("");
  const [code, setCode] = useState("");
  const [chain, setChain] = useState("EVM");

  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [codeInfo, setCodeInfo] = useState(null);

  // Parse wallets from textarea (comma or new line)
  const parseWallets = (input) =>
    input.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean);

  // Check code live
  useEffect(() => {
    if (!code) return setCodeInfo(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/.netlify/functions/checkCode?code=${code}`);
        const data = await res.json();
        if (data.valid) setCodeInfo(data);
        else setCodeInfo(null);
      } catch {
        setCodeInfo(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  const submitWallets = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    setAccepted([]);
    setRejected([]);

    const wallets = parseWallets(walletInput);
    if (wallets.length === 0) return setMessage("No wallets detected");

    try {
      const res = await fetch("/.netlify/functions/submitWallet", {
        method: "POST",
        body: JSON.stringify({ code, chain, wallets }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
        if (data.rejected) setRejected(data.rejected);
        return;
      }

      setAccepted(data.accepted || []);
      setRejected(data.rejected || []);
      setMessage(data.message || "Submitted successfully!");
      setWalletInput("");

      // Refresh remaining quota
      if (code) {
        const refresh = await fetch(`/.netlify/functions/checkCode?code=${code}`);
        const refreshed = await refresh.json();
        if (refreshed.valid) setCodeInfo(refreshed);
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Wallet Submission</h2>
      <form onSubmit={submitWallets}>
        <textarea
          className="border p-2 w-full mb-2 rounded h-32"
          placeholder="Paste wallets here (one per line or comma separated)"
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Community Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        {codeInfo && (
          <div className="bg-gray-50 border p-2 mb-2 text-sm">
            <p><b>Tier:</b> {codeInfo.tier_name}</p>
            <p><b>Remaining:</b> {codeInfo.remaining} / {codeInfo.max_submissions}</p>
          </div>
        )}
        <select
          className="border p-2 w-full mb-2 rounded"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        >
          <option value="EVM">EVM</option>
          <option value="Solana">Solana</option>
          <option value="Aptos">Aptos</option>
          <option value="Sui">Sui</option>
          <option value="BTC">Bitcoin</option>
        </select>
        <button className="bg-black text-white p-2 w-full rounded">Submit Wallets</button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}

      {accepted.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-green-700">Accepted ({accepted.length})</h3>
          <div className="text-xs bg-green-50 border p-2 rounded mt-1 max-h-32 overflow-auto">
            {accepted.map((w, i) => <div key={i} className="font-mono">{w}</div>)}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-red-700">Rejected ({rejected.length})</h3>
          <div className="text-xs bg-red-50 border p-2 rounded mt-1 max-h-32 overflow-auto">
            {rejected.map((r, i) => <div key={i} className="font-mono">{r.wallet} — {r.reason}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
