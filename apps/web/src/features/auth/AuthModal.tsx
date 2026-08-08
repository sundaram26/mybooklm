"use client";

import React, { useState } from "react";
import { X, LogIn, UserCheck, Shield } from "lucide-react";
import { authClient } from "../../lib/auth-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.href,
      });
    } catch (err: any) {
      alert(`OAuth login failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await authClient.signIn.anonymous();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Guest login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-[440px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-[10px]">
            <div className="p-2 rounded-[var(--radius-md)] bg-[var(--accent-blue-light)] text-[var(--accent-blue)]">
              <LogIn size={20} />
            </div>
            <h3 className="text-[1.2rem] font-bold text-[var(--text-primary)]">Sign In / Guest Access</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-[6px]">
            <X size={18} />
          </button>
        </div>

        <p className="text-[0.88rem] text-[var(--text-muted)] mb-6 leading-[1.5]">
          Sign in to save your notebooks across devices, or continue as a guest (up to 10 prompts per notebook).
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="btn btn-secondary p-3 justify-center"
          >
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={loading}
            className="btn btn-secondary p-3 justify-center"
          >
            <span>Continue with GitHub</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" />
            <span className="text-[0.75rem] text-[var(--text-muted)]">OR</span>
            <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" />
          </div>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn btn-primary p-3 justify-center"
          >
            <UserCheck size={18} />
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
