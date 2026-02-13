import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      setProjects(data || []);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/create" className="bg-black text-white px-4 py-2 rounded">
          Create Project
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link key={p.id} to={`/admin/manage/${p.slug}`} className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{p.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
 
