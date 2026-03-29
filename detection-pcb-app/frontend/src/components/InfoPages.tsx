import React from "react";
import { motion } from "motion/react";
import { Shield, FileText, Code, ArrowLeft } from "lucide-react";
import { Page } from "../types";

interface InfoPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<InfoPageProps> = ({ onBack }) => (
  <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <Shield className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
      </div>
      <div className="glass p-8 rounded-3xl space-y-6 text-zinc-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Data Collection</h2>
          <p>We collect information you provide directly to us, such as when you create an account, upload PCB images for analysis, or contact support. This includes your name, email address, and the images you submit.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Use of Information</h2>
          <p>The information we collect is used to provide, maintain, and improve our PCB defect detection services. We use AI models to analyze images and provide results. Your data helps us refine these models over time.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information and uploaded data from unauthorized access, disclosure, or destruction.</p>
        </section>
      </div>
    </motion.div>
  </div>
);

export const TermsOfService: React.FC<InfoPageProps> = ({ onBack }) => (
  <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <FileText className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
      </div>
      <div className="glass p-8 rounded-3xl space-y-6 text-zinc-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using PCB Vision AI, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Use of Service</h2>
          <p>You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Intellectual Property</h2>
          <p>All content and software provided through the service are the property of PCB Vision AI or its licensors and are protected by intellectual property laws.</p>
        </section>
      </div>
    </motion.div>
  </div>
);

export const APIDocumentation: React.FC<InfoPageProps> = ({ onBack }) => (
  <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <Code className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">API Documentation</h1>
      </div>
      <div className="glass p-8 rounded-3xl space-y-6 text-zinc-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Authentication</h2>
          <p>All API requests must include a valid authentication token in the header. You can obtain a token by logging in through the web interface.</p>
          <pre className="bg-black/40 p-4 rounded-xl text-indigo-300 overflow-x-auto">
            Authorization: Bearer YOUR_TOKEN
          </pre>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Endpoints</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold">POST /api/history</h3>
              <p className="text-sm">Submit a new PCB image for analysis.</p>
            </div>
            <div>
              <h3 className="text-white font-bold">GET /api/history</h3>
              <p className="text-sm">Retrieve your detection history.</p>
            </div>
            <div>
              <h3 className="text-white font-bold">GET /api/stats</h3>
              <p className="text-sm">Get aggregated statistics for your detections.</p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  </div>
);
