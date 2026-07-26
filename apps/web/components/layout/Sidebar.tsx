"use client";

import React from "react";
import Image from "next/image";
import { 
  Folder, 
  Home, 
  FileText, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  LogIn, 
  LogOut, 
  ShieldAlert
} from "lucide-react";
import { useTheme } from "../theme-provider";

interface SidebarProps {
  currentView: "dashboard" | "notebook" | "sources" | "settings";
  onSelectView: (view: "dashboard" | "notebook" | "sources" | "settings") => void;
  onGoToLanding: () => void;
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
  guestTurnCount?: number;
}

export function Sidebar({
  currentView,
  onSelectView,
  onGoToLanding,
  user,
  onOpenAuth,
  onSignOut,
  guestTurnCount = 0,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="app-sidebar">
      {/* Brand Header using Public Logo Images */}
      <div className="flex flex-col gap-6">
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onGoToLanding}
          title="noetalm - Back to Home"
        >
          <Image 
            src="/logo-icon-mark.png" 
            alt="noetalm logo" 
            width={32} 
            height={32}
            className="object-contain"
          />
          <Image 
            src="/logo-wordmark.png" 
            alt="noetalm" 
            width={90} 
            height={24}
            className="object-contain"
          />
        </div>

        {/* Navigation Items matching Image 2 */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onSelectView("dashboard")}
            className={`btn w-full justify-start p-[10px_12px] ${currentView === "dashboard" ? "btn-primary" : "btn-ghost"}`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView("dashboard")}
            className={`btn w-full justify-start p-[10px_12px] ${currentView === "notebook" ? "btn-primary" : "btn-ghost"}`}
          >
            <Folder size={18} />
            <span>Projects / Notebooks</span>
          </button>

          <button
            onClick={() => onSelectView("sources")}
            className={`btn w-full justify-start p-[10px_12px] ${currentView === "sources" ? "btn-primary" : "btn-ghost"}`}
          >
            <FileText size={18} />
            <span>Sources</span>
          </button>

          <button
            onClick={() => onSelectView("settings")}
            className={`btn w-full justify-start p-[10px_12px] ${currentView === "settings" ? "btn-primary" : "btn-ghost"}`}
          >
            <Settings size={18} />
            <span>LLM Keys & Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer Area: Theme Switcher & User Profile */}
      <div className="flex flex-col gap-4">
        {/* Guest Limit Badge if anonymous */}
        {(!user || (user as any).isAnonymous) && (
          <div className="bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] p-[10px_12px] rounded-lg text-[0.78rem] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldAlert size={14} />
              <span>Guest Mode</span>
            </div>
            <span>Prompts used: {guestTurnCount} / 10 limit</span>
          </div>
        )}

        {/* Theme Switcher Widget */}
        <div className="flex items-center justify-between bg-canvas-subtle p-1 rounded-lg">
          <button
            onClick={() => setTheme("light")}
            title="Light Theme"
            className={`flex-1 p-1.5 border-none rounded-md flex justify-center cursor-pointer ${theme === "light" ? "bg-surface text-accent-blue" : "bg-transparent text-text-muted"}`}
          >
            <Sun size={15} />
          </button>
          <button
            onClick={() => setTheme("dark")}
            title="Dark Theme"
            className={`flex-1 p-1.5 border-none rounded-md flex justify-center cursor-pointer ${theme === "dark" ? "bg-surface text-accent-blue" : "bg-transparent text-text-muted"}`}
          >
            <Moon size={15} />
          </button>
          <button
            onClick={() => setTheme("system")}
            title="System Theme"
            className={`flex-1 p-1.5 border-none rounded-md flex justify-center cursor-pointer ${theme === "system" ? "bg-surface text-accent-blue" : "bg-transparent text-text-muted"}`}
          >
            <Monitor size={15} />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas-subtle border border-border-subtle">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-blue-light)] text-accent-blue flex items-center justify-center font-bold text-[0.85rem] shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "G"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[0.82rem] font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.name || "Guest User"}
              </span>
              <span className="text-[0.72rem] text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.email || "Temporary session"}
              </span>
            </div>
          </div>

          {user && !(user as any).isAnonymous ? (
            <button 
              onClick={onSignOut}
              className="btn btn-ghost p-1.5 text-text-muted" 
              title="Sign Out" 
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="btn btn-ghost p-1.5 text-accent-blue" 
              title="Sign In" 
            >
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
