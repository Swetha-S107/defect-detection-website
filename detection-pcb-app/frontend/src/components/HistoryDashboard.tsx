import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Trash2, Calendar, Tag, AlertCircle, CheckCircle2, Eye, Download, Activity } from "lucide-react";
import { DetectionResult, User } from "../types";
import { ResultDisplay } from "./ResultDisplay";

interface HistoryItem {
  id: number;
  image_data: string;
  result_json: DetectionResult;
  status: string;
  defect_type: string | null;
  confidence: number;
  created_at: string;
}

interface HistoryDashboardProps {
  user: User;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ user }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        console.error("History data is not an array:", data);
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const deleteRecord = async (id: number) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        setItemToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.result_json.explanation.toLowerCase().includes(search.toLowerCase()) ||
                         (h.defect_type?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "All" || h.status === filter || h.defect_type === filter;
    return matchesSearch && matchesFilter;
  });

  const defectTypes = Array.from(new Set(history.map(h => h.defect_type).filter(Boolean)));

  return (
    <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Detection History</h1>
            <p className="text-zinc-400">Manage and review your previous PCB defect analysis records.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all disabled:opacity-50"
              title="Refresh History"
            >
              <Activity className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-full md:w-64"
              />
            </div>
            
            <div className="relative flex-grow md:flex-grow-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none w-full md:w-48"
              >
                <option value="All">All Status</option>
                <option value="Normal">Normal</option>
                <option value="Defected">Defected</option>
                <option value="Invalid">Invalid Image</option>
                {defectTypes.map(type => (
                  <option key={type} value={type!}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl border-dashed border-2 border-white/5">
                <p className="text-zinc-500">No records found matching your criteria.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  layoutId={item.id.toString()}
                  onClick={() => setSelectedItem(item)}
                  className={`glass p-4 rounded-2xl flex items-center gap-6 cursor-pointer hover:border-indigo-500/30 transition-all group ${selectedItem?.id === item.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : ''}`}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={item.image_data} alt="PCB" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Normal' ? 'bg-indigo-500/10 text-indigo-400' : 
                        item.status === 'Invalid' ? 'bg-zinc-500/10 text-zinc-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-white font-bold truncate">
                      {item.defect_type || "No Defect Detected"}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate">{item.result_json.explanation}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{item.confidence.toFixed(1)}%</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Confidence</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="sticky top-32 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Record Details</h2>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <ResultDisplay result={selectedItem.result_json} previewUrl={selectedItem.image_data} />
              </div>
            ) : (
              <div className="sticky top-32 h-[400px] flex flex-col items-center justify-center glass rounded-3xl p-8 text-center border-dashed border-2 border-white/5">
                <Eye className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-bold text-zinc-500 mb-2">Select a Record</h3>
                <p className="text-xs text-zinc-600">Click on a history item to view the full analysis and defect highlights.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Delete Record</h2>
              </div>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Are you sure you want to delete this inspection record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteRecord(itemToDelete)}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
