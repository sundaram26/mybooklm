"use client";

import React, { useState } from "react";
import { X, Key, Cpu, Check } from "lucide-react";

interface KeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey?: string;
  customModelId?: string;
  onSaveKeys: (key: string, model: string) => void;
}

export function KeySettingsModal({
  isOpen,
  onClose,
  customApiKey = "",
  customModelId = "gemini-2.0-flash",
  onSaveKeys,
}: KeySettingsModalProps) {
  const [apiKey, setApiKey] = useState(customApiKey);
  const [modelId, setModelId] = useState(customModelId);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(apiKey.trim(), modelId.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
              <Key size={20} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>Custom LLM & API Keys</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Target Model
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-canvas)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none"
              }}
            >
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Default)</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
              <option value="claude-3-5-haiku-20241022">Anthropic Claude 3.5 Haiku</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Custom API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave empty to use server default key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-canvas)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              If provided, synthesis requests will route directly using your personal API key.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
