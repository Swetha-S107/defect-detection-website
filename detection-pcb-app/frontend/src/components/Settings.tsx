import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings as SettingsIcon, Bell, Shield, Database, Save, Loader2, CheckCircle, Cpu } from "lucide-react";

interface SettingsState {
  notifications: boolean;
  security: boolean;
  data_management: boolean;
  sensitivity: number;
  auto_save: boolean;
  model_type: string;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    security: true,
    data_management: true,
    sensitivity: 50,
    auto_save: false,
    model_type: "gemini-3-flash",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          notifications: !!data.notifications,
          security: !!data.security,
          data_management: !!data.data_management,
          sensitivity: data.sensitivity,
          auto_save: !!data.auto_save,
          model_type: data.model_type || "gemini-3-flash",
        });
        setLoading(false);
      })
      .catch(err => console.error("Failed to fetch settings:", err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const models = [
    { id: "gemini-3-flash", name: "Gemini 3 Flash (Fast)", accuracy: "94.2%", speed: "Ultra Fast", desc: "Optimized for real-time detection with low latency." },
    { id: "gemini-3-pro", name: "Gemini 3 Pro (Advanced)", accuracy: "98.7%", speed: "Balanced", desc: "High-precision model for complex multi-layer PCBs." },
    { id: "resnet-50", name: "ResNet-50 (Legacy)", accuracy: "89.5%", speed: "Fast", desc: "Standard convolutional neural network for basic defects." },
  ];

  return (
    <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <SettingsIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Settings</h1>
            <p className="text-zinc-400">Configure your PCB Vision preferences.</p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <Cpu className="w-6 h-6 text-indigo-400" />
            AI Model Selection
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {models.map((model) => (
              <div 
                key={model.id}
                onClick={() => setSettings(prev => ({ ...prev, model_type: model.id }))}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  settings.model_type === model.id 
                    ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/20" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">{model.name}</h4>
                    <p className="text-sm text-zinc-500">{model.desc}</p>
                  </div>
                  {settings.model_type === model.id && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-lg text-xs font-bold text-indigo-400">
                    Accuracy: {model.accuracy}
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-lg text-xs font-bold text-indigo-400">
                    Speed: {model.speed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { id: "notifications" as const, icon: Bell, title: "Notifications", desc: "Manage alerts for defect detections and system updates." },
            { id: "security" as const, icon: Shield, title: "Security", desc: "Configure access controls and data encryption settings." },
            { id: "data_management" as const, icon: Database, title: "Data Management", desc: "Manage your detection history and exported reports." }
          ].map((item, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500/5 rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                  <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof SettingsState] }))}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  settings[item.id as keyof SettingsState] 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                    : "bg-indigo-500/5 text-zinc-400 border border-indigo-500/10"
                }`}
              >
                {settings[item.id as keyof SettingsState] ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold text-white">Advanced Configuration</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-300">Detection Sensitivity</label>
                <span className="text-indigo-400 font-mono">{settings.sensitivity}%</span>
              </div>
              <input 
                type="range" 
                value={settings.sensitivity}
                onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: parseInt(e.target.value) }))}
                className="w-full h-2 bg-indigo-500/10 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-indigo-500/20" 
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSettings(prev => ({ ...prev, auto_save: !prev.auto_save }))}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                  settings.auto_save ? "bg-indigo-500 border-indigo-500" : "bg-indigo-500/5 border-indigo-500/20"
                }`}
              >
                {settings.auto_save && <CheckCircle className="w-4 h-4 text-white" />}
              </button>
              <span className="text-zinc-300 font-medium">Auto-save results to cloud history</span>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saved ? "Changes Saved!" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
