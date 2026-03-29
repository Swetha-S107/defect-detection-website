import React, { useState } from "react";
import { Home, Settings, LifeBuoy, Cpu, Camera, History, BarChart3, Shield, User as UserIcon, LogOut, Mail } from "lucide-react";
import { Page, User } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "camera", label: "Live Scan", icon: Camera },
    { id: "history", label: "History", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Support", icon: LifeBuoy },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onPageChange("home")}>
            <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PCB Vision</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as Page)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? "text-indigo-400 bg-indigo-400/10"
                    : "text-zinc-400 hover:text-white hover:bg-indigo-500/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-indigo-500/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <span>{user.name}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:hidden">
            {/* Mobile menu button could go here */}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
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
                  <LogOut className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Confirm Logout</h2>
              </div>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Are you sure you want to sign out of your account? You will need to log in again to access your history and analysis tools.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
