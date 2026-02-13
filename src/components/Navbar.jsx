import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          WlCollab
        </Link>

        <div className="flex gap-3">
          <a
            href="https://x.com/WlCollab"
            target="_blank"
            className="text-sm text-white/70 hover:text-white transition"
          >
            X (@WlCollab)
          </a>

          <Link
            to="/admin"
            className="text-sm bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-white/90 transition"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
