import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Link } from "react-router-dom";

export default function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      setProjects(data || []);
    };
    loadProjects();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">WlCollab</h1>
        <Link to="/admin" className="bg-black text-white px-4 py-2 rounded">
          Admin
        </Link>
      </div>

      <p className="text-gray-600 mb-6">
        Wallet collector for collab managers. X: @WlCollab
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/project/${p.slug}`}
            className="bg-white shadow rounded p-4 hover:scale-[1.01] transition"
          >
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-600 text-sm mt-2">{p.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
 
