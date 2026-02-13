import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Wallet Collection <span className="text-white/50">for Collab Managers</span>
        </h1>

        <p className="text-white/70 mt-5 max-w-2xl mx-auto text-lg">
          WlCollab helps creators collect wallets securely using unique community codes,
          GTD allocations, FCFS limits, and tiered allowlists — all in one clean page.
        </p>

        <div className="flex justify-center gap-3 mt-8">
          <Link
            to="/admin"
            className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-white/90 transition"
          >
            Create Project
          </Link>

          <a
            href="https://x.com/WlCollab"
            target="_blank"
            className="border border-white/20 px-6 py-3 rounded-2xl font-semibold text-white hover:bg-white/10 transition"
          >
            Follow on X
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-16">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold">Unique Codes</h3>
          <p className="text-white/70 mt-2 text-sm">
            Generate a different code for each community and control their allocation.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold">GTD + FCFS Tiers</h3>
          <p className="text-white/70 mt-2 text-sm">
            Set multiple allowlist tiers (Allowlist 1, Allowlist 2, GTD, FCFS etc.)
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold">Quota Protection</h3>
          <p className="text-white/70 mt-2 text-sm">
            Wallet submissions automatically stop when the allocated quota is reached.
          </p>
        </div>
      </div>

      <div className="mt-20 text-center text-white/40 text-sm">
        Built for creators & collab managers • WlCollab © {new Date().getFullYear()}
      </div>
    </div>
  );
}
