"use client";

import { useEffect, useState } from "react";
import { Upload, FileDown, CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  getAdminCV,
  uploadAdminCV,
  publishAdminCV,
  unpublishAdminCV
} from "../../../lib/api";

export default function AdminCVManager() {
  const [cvDocs, setCvDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publicFilename, setPublicFilename] = useState("Oduor_Daivine_Oluoch_CV.pdf");
  const [version, setVersion] = useState("1.1");
  const [uploading, setUploading] = useState(false);

  const fetchCVs = () => {
    setLoading(true);
    getAdminCV()
      .then((data) => {
        setCvDocs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("public_filename", publicFilename);
    formData.append("version", version);
    formData.append("is_published", "true");

    try {
      await uploadAdminCV(formData);
      setSelectedFile(null);
      fetchCVs();
    } catch (err: any) {
      alert("CV Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishAdminCV(id);
      fetchCVs();
    } catch (err: any) {
      alert("Publish failed: " + err.message);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishAdminCV(id);
      fetchCVs();
    } catch (err: any) {
      alert("Unpublish failed: " + err.message);
    }
  };

  const activeCV = cvDocs.find((c) => c.is_published);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CV / Résumé Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload verified PDF documents, set public filenames, and toggle public download availability.
        </p>
      </div>

      {/* Active CV Status Card */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-4 card-glow">
        <div className="flex items-center justify-between border-b border-navy-600/60 pb-4">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Active Public Download</h3>
          </div>
          {activeCV ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-500/40">
              Published Live
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-900/40 text-rose-300 border border-rose-500/40">
              Unpublished
            </span>
          )}
        </div>

        {activeCV ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="font-bold text-white text-sm">{activeCV.public_filename}</p>
              <p className="text-xs text-slate-400 mt-1">
                Version {activeCV.version} &bull; Uploaded on {new Date(activeCV.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"}/public/cv`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 border border-navy-600 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Current</span>
              </a>
              <button
                onClick={() => handleUnpublish(activeCV.id)}
                className="px-4 py-2 rounded-xl bg-navy-700 hover:bg-amber-900/40 text-slate-300 hover:text-amber-300 border border-navy-600 text-xs font-semibold flex items-center gap-1.5"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Unpublish</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No CV document is currently published. The public download button is hidden.
          </p>
        )}
      </div>

      {/* Upload Replacement Form */}
      <form onSubmit={handleUpload} className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-navy-600/60 pb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-400" />
          Upload Replacement CV Document
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Public Download Filename
            </label>
            <input
              type="text"
              required
              value={publicFilename}
              onChange={(e) => setPublicFilename(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs focus:border-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select PDF File *
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 flex items-center gap-2"
        >
          {uploading ? <span>Uploading...</span> : <span>Upload & Set Live</span>}
        </button>
      </form>
    </div>
  );
}
