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
      <div className="modal-content" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
              <LogIn size={20} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>Sign In / Guest Access</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.5" }}>
          Sign in to save your notebooks across devices, or continue as a guest (up to 10 prompts per notebook).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: "12px", justifyContent: "center" }}
          >
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: "12px", justifyContent: "center" }}
          >
            <span>Continue with GitHub</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
          </div>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "12px", justifyContent: "center" }}
          >
            <UserCheck size={18} />
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
