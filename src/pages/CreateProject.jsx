import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [allowDuplicateBlock, setAllowDuplicateBlock] = useState(false);
  const [allowMultiChain, setAllowMultiChain] = useState(true);

  const navigate = useNavigate();

  const create = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("projects").insert({
      name,
      slug,
      description,
      allow_duplicate_block: allowDuplicateBlock,
      allow_multi_chain: allowMultiChain,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>

      <form onSubmit={create} className="bg-white p-4 shadow rounded">
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Slug (example: myproject)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <textarea
          className="border p-2 w-full mb-2 rounded"
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={allowDuplicateBlock}
            onChange={(e) => setAllowDuplicateBlock(e.target.checked)}
          />
          Block duplicate wallets (optional)
        </label>

        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={allowMultiChain}
            onChange={(e) => setAllowMultiChain(e.target.checked)}
          />
          Allow multi-chain submissions (optional)
        </label>

        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Create Project
        </button>
      </form>
    </div>
  );
}
 
