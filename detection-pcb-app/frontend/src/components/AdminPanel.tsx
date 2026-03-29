import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, User, LogOut, Activity, Users, Database, FileText, Settings, RefreshCw, AlertCircle } from "lucide-react";
import { Analytics } from "./Analytics";

export const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        setUsername(data.username);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-8 rounded-3xl space-y-8 border border-white/10 shadow-2xl"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-zinc-500">Secure access for system administrators only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <Shield className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-400 flex items-center gap-2">
            Logged in as <span className="text-indigo-400 font-bold">{username}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-2">
          {[
            { id: "stats", label: "System Stats", icon: Activity },
            { id: "users", label: "User Management", icon: Users },
            { id: "logs", label: "System Logs", icon: FileText },
            { id: "model", label: "Model Training", icon: RefreshCw },
            { id: "db", label: "Database", icon: Database },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-zinc-500 hover:text-white hover:bg-indigo-500/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all mt-8"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </aside>

        <main className="flex-grow">
          {activeTab === "stats" && <Analytics />}
          
          {activeTab === "users" && (
            <div className="glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="pb-4 font-bold">User</th>
                      <th className="pb-4 font-bold">Role</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { name: "Admin User", role: "Super Admin", status: "Active", last: "Just now" },
                      { name: "QC Engineer 1", role: "Editor", status: "Active", last: "2h ago" },
                      { name: "QC Engineer 2", role: "Viewer", status: "Inactive", last: "3d ago" },
                    ].map((u, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="py-4 text-white font-medium">{u.name}</td>
                        <td className="py-4 text-zinc-400">{u.role}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-500'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-500">{u.last}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold text-white">System Logs</h2>
              <div className="bg-black/40 rounded-xl p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-zinc-600">[{new Date().toISOString()}]</span>
                    <span className="text-indigo-400">INFO</span>
                    <span className="text-zinc-400">Detection processed successfully for PCB-ID-{1000 + i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "model" && (
            <div className="glass p-8 rounded-3xl space-y-8">
              <h2 className="text-2xl font-bold text-white">Model Training & Dataset</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Current Model Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Active Model</span>
                      <span className="text-white font-bold">Gemini-3-Flash (Vision)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Last Trained</span>
                      <span className="text-white font-bold">2026-02-20</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Dataset Size</span>
                      <span className="text-white font-bold">12,450 Images</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Training Controls</h3>
                  <button className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 mb-4">
                    <RefreshCw className="w-4 h-4" /> Retrain Model
                  </button>
                  <button className="w-full py-3 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">
                    Upload New Dataset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
