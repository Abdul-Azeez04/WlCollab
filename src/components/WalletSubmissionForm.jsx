import { useState } from "react";
import { validateWallet } from "../utils/validation";

export default function WalletSubmissionForm() {
  const [wallet, setWallet] = useState("");
  const [code, setCode] = useState("");
  const [chain, setChain] = useState("EVM");
  const [message, setMessage] = useState("");

  const submitWallet = async (e) => {
    e.preventDefault();

    if (!validateWallet(wallet, chain)) {
      setMessage("Invalid wallet format for selected chain.");
      return;
    }

    const res = await fetch("/.netlify/functions/submitWallet", {
      method: "POST",
      body: JSON.stringify({ wallet, code, chain }),
    });

    const data = await res.json();
    setMessage(data.error || "Wallet submitted successfully!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Submit Wallet</h2>

      <form onSubmit={submitWallet}>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Enter wallet address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Enter community code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <select
          className="border p-2 w-full mb-2"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        >
          <option value="EVM">EVM</option>
          <option value="Solana">Solana</option>
          <option value="Aptos">Aptos</option>
          <option value="Sui">Sui</option>
          <option value="BTC">BTC</option>
        </select>

        <button className="bg-black text-white p-2 w-full rounded">
          Submit
        </button>
      </form>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
 
