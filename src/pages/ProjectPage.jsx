import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import WalletSubmissionForm from "../components/WalletSubmissionForm";

export default function ProjectPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      const { data } = await supabase.from("projects").select("*").eq("slug", slug).single();
      setProject(data);
    };
    loadProject();
  }, [slug]);

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded shadow p-4 mb-4">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>

        <WalletSubmissionForm projectSlug={slug} />
      </div>
    </div>
  );
}
 
