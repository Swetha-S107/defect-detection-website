import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Activity, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { User } from "../types";

interface Stats {
  total: number;
  normal: number;
  defected: number;
  defectTypes: { name: string; value: number }[];
  monthlyTrend: { month: string; count: number }[];
}

const COLORS = ["#6366f1", "#ef4444", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899"];

interface AnalyticsProps {
  user?: User;
}

export const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    const url = user ? `/api/stats?userId=${user.id}` : "/api/stats";
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
        setRefreshing(false);
        setError("Could not load analytics data. Please try again.");
      });
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="pt-32 px-4 max-w-7xl mx-auto text-center">
        <div className="glass p-12 rounded-3xl border border-white/5">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Error</h2>
          <p className="text-zinc-400 mb-6">{error || "Something went wrong"}</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Normal", value: stats.normal },
    { name: "Defected", value: stats.defected },
  ];

  return (
    <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-white mb-4">Analytics & Insights</h1>
          <p className="text-zinc-400">Real-time statistics and defect trends from your inspection history.</p>
          
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="absolute top-0 right-0 p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-all disabled:opacity-50"
            title="Refresh Analytics"
          >
            <Activity className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Inspections", value: stats.total, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Normal PCBs", value: stats.normal, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Defected PCBs", value: stats.defected, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Defect Rate", value: stats.total ? `${((stats.defected / stats.total) * 100).toFixed(1)}%` : "0%", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              Inspection Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Defect Type Frequency
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.defectTypes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Defect Trend (Monthly)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
