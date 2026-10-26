"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import {
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill
} from "../../../lib/api";

export default function AdminSkillsManager() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Frontend",
    proficiency_value: 85,
    proficiency_label: "Proficient",
    display_order: 1,
    is_visible: true,
  });

  const fetchSkills = () => {
    setLoading(true);
    getAdminSkills()
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name) return;
    try {
      await createAdminSkill(newSkill);
      setNewSkill({
        name: "",
        category: "Frontend",
        proficiency_value: 85,
        proficiency_label: "Proficient",
        display_order: skills.length + 1,
        is_visible: true,
      });
      fetchSkills();
    } catch (err: any) {
      alert("Error adding skill: " + err.message);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteAdminSkill(id);
      fetchSkills();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Technologies & Skills Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Add, configure, and reorder engineering technologies and proficiency levels.
        </p>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-navy-600/60 pb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" />
          Add Technology
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Technology Name *
            </label>
            <input
              type="text"
              required
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g. Docker"
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            >
              <option value="Languages">Languages</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Databases">Databases</option>
              <option value="AI / ML">AI / Machine Learning</option>
              <option value="DevOps">DevOps & Cloud</option>
              <option value="Security">Cybersecurity</option>
              <option value="Tools">Developer Tools</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Proficiency ({newSkill.proficiency_value}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={newSkill.proficiency_value}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency_value: Number(e.target.value) })}
              className="w-full accent-brand-500 mt-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Technology</span>
            </button>
          </div>
        </div>
      </form>

      {/* Skills List Table */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-navy-600/60">
              <tr>
                <th className="px-6 py-4">Technology</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Proficiency Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/40">
              {skills.map((s) => (
                <tr key={s.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{s.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-navy-900 rounded-full h-2 overflow-hidden border border-navy-600/40">
                        <div
                          className="bg-brand-500 h-full rounded-full"
                          style={{ width: `${s.proficiency_value || 85}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {s.proficiency_value}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
