import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-400 uppercase bg-indigo-400/10 border border-indigo-400/20 rounded-full">
            AI-Powered Quality Control
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Vision-Based Machine Learning <br />
            <span className="text-gradient">PCB Defect Detection</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400 mb-10">
            Ensure manufacturing excellence with our advanced computer vision system. 
            Instantly detect soldering issues, missing components, and circuit defects 
            with high precision.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#uploader" className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              Start Detection <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#info" className="px-8 py-4 bg-indigo-500/10 text-white border border-indigo-500/20 rounded-xl font-semibold hover:bg-indigo-500/20 transition-all backdrop-blur-sm">
              Learn More
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { icon: ShieldCheck, title: "High Accuracy", desc: "Trained on thousands of PCB samples for reliable defect classification." },
            { icon: Zap, title: "Real-time Analysis", desc: "Get detailed results in seconds with our optimized vision models." },
            { icon: BarChart3, title: "Detailed Reports", desc: "Comprehensive breakdown of defect types and suggested solutions." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 glass rounded-2xl text-left hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
