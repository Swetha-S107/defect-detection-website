import React from "react";
import { motion } from "motion/react";
import { Info, Layers, Target, Activity } from "lucide-react";

export const PCBInfo: React.FC = () => {
  return (
    <section id="info" className="py-24 px-4 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-semibold">
              <Info className="w-4 h-4" />
              Educational Resources
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight">
              Understanding PCB and <br />
              <span className="text-gradient">Defect Detection</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 glass rounded-lg flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">What is a PCB?</h4>
                  <p className="text-zinc-400">
                    A Printed Circuit Board (PCB) is the backbone of modern electronics. 
                    It mechanically supports and electrically connects electronic components 
                    using conductive tracks, pads, and other features etched from copper sheets 
                    laminated onto a non-conductive substrate.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 glass rounded-lg flex items-center justify-center shadow-sm">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Types of PCB</h4>
                  <ul className="text-zinc-400 list-disc list-inside space-y-1">
                    <li>Single-sided PCBs: Simplest, one layer of substrate.</li>
                    <li>Double-sided PCBs: Copper layers on both sides.</li>
                    <li>Multi-layer PCBs: Multiple layers of substrate and copper.</li>
                    <li>Rigid, Flexible, and Rigid-Flex PCBs.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 glass rounded-lg flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Importance of Detection</h4>
                  <p className="text-zinc-400">
                    Manual inspection is slow and error-prone. Automated defect detection 
                    reduces manufacturing costs, improves product reliability, and 
                    ensures high-quality standards in high-volume production environments.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-indigo-500/5 rounded-3xl border border-indigo-500/10 p-8 flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" 
                alt="High Quality PCB" 
                className="rounded-2xl shadow-2xl object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 glass-dark p-6 rounded-2xl shadow-xl border border-white/10 max-w-[240px]">
                <p className="text-sm font-bold text-white mb-2">How it works:</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Our system uses a Vision-Based Machine Learning model (CNN) to analyze 
                  surface patterns, identifying anomalies in soldering, component placement, 
                  and circuit integrity.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
