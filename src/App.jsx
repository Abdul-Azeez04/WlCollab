import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProject from "./pages/CreateProject";
import ManageProject from "./pages/ManageProject";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:slug" element={<ProjectPage />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/create" element={<CreateProject />} />
      <Route path="/admin/manage/:slug" element={<ManageProject />} />
    </Routes>
  );
}
