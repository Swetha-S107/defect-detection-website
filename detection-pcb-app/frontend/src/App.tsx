import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { PCBInfo } from "./components/PCBInfo";
import { Uploader } from "./components/Uploader";
import { Settings } from "./components/Settings";
import { Support } from "./components/Support";
import { CameraDetection } from "./components/CameraDetection";
import { HistoryDashboard } from "./components/HistoryDashboard";
import { Analytics } from "./components/Analytics";
import { AdminPanel } from "./components/AdminPanel";
import { AuthPage } from "./components/AuthPage";
import { PrivacyPolicy, TermsOfService, APIDocumentation } from "./components/InfoPages";
import { Page, User } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("pcb_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("pcb_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pcb_user");
    setCurrentPage("home");
  };

  if (loading) return null;

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} user={user} onLogout={handleLogout} />
      
      <main>
        {currentPage === "home" && (
          <>
            <Hero />
            <PCBInfo />
            <Uploader user={user} />
          </>
        )}
        
        {currentPage === "camera" && <CameraDetection user={user} />}
        {currentPage === "history" && <HistoryDashboard user={user} />}
        {currentPage === "analytics" && <Analytics user={user} />}
        {currentPage === "settings" && <Settings />}
        {currentPage === "support" && <Support />}
        {currentPage === "admin" && <AdminPanel />}
        {currentPage === "privacy" && <PrivacyPolicy onBack={() => setCurrentPage("home")} />}
        {currentPage === "terms" && <TermsOfService onBack={() => setCurrentPage("home")} />}
        {currentPage === "api-docs" && <APIDocumentation onBack={() => setCurrentPage("home")} />}
      </main>

      <footer className="py-12 px-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
            </div>
            <span className="text-lg font-bold text-white">PCB Vision</span>
          </div>
          
          <div className="flex gap-8 text-sm text-zinc-400 font-medium">
            <button onClick={() => setCurrentPage("privacy")} className="hover:text-indigo-400 transition-colors">Privacy Policy</button>
            <button onClick={() => setCurrentPage("terms")} className="hover:text-indigo-400 transition-colors">Terms of Service</button>
            <button onClick={() => setCurrentPage("api-docs")} className="hover:text-indigo-400 transition-colors">API Documentation</button>
          </div>
          
          <p className="text-sm text-zinc-400">
            © 2026 PCB Vision AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
