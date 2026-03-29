import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MessageSquare, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const faqs = [
  {
    question: "How accurate is the PCB defect detection?",
    answer: "Our system uses advanced vision-based machine learning models trained on high-resolution PCB datasets, achieving over 95% accuracy in controlled lighting conditions."
  },
  {
    question: "What image formats are supported?",
    answer: "We support standard image formats including PNG, JPG, and JPEG. For best results, ensure the PCB is well-lit and the camera is perpendicular to the board."
  },
  {
    question: "Can it detect defects on multi-layer PCBs?",
    answer: "Yes, the system can detect surface-level defects on multi-layer PCBs, including soldering issues, component mismatches, and surface trace anomalies."
  },
  {
    question: "How do I interpret the confidence score?",
    answer: "The confidence score represents the model's certainty in its classification. A score above 85% is considered highly reliable."
  }
];

export const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit support query. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit support query:", err);
      setError("A network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Customer Support</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Need help with your PCB analysis? Our team of engineers and support staff 
            are here to assist you with any technical queries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
                Send us a Message
              </h2>
              
              {formSubmitted ? (
                <div className="bg-indigo-500/10 p-8 rounded-2xl text-center border border-indigo-500/20">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-400 mb-2">Message Sent!</h3>
                  <p className="text-indigo-500/70">We'll get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 text-indigo-400 font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Subject</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      placeholder="Technical Issue" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Message</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      placeholder="Describe your issue in detail..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              {faqs.map((faq, i) => (
                <div key={i} className="glass border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-white">{faq.question}</span>
                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-dark text-white p-8 rounded-3xl space-y-8">
              <h3 className="text-xl font-bold">Contact Info</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <Mail className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Email Support</p>
                    <p className="font-semibold">kaviyasrik.dev@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <Phone className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Phone Support</p>
                    <p className="font-semibold">1234567890</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-sm text-zinc-400 mb-4">Operating Hours:</p>
                <p className="text-sm font-medium">Mon - Fri: 9:00 AM - 6:00 PM EST</p>
              </div>
            </div>

            <div className="bg-indigo-500 p-8 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
              <h3 className="text-xl font-bold mb-4">Enterprise Support</h3>
              <p className="text-indigo-50 mb-6 text-sm leading-relaxed">
                Looking for custom integrations or high-volume API access? 
                Talk to our enterprise solutions team.
              </p>
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, subject: "Enterprise Solutions Inquiry" }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 bg-indigo-400 text-white rounded-xl font-bold hover:bg-indigo-300 transition-colors border border-indigo-300/20"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
