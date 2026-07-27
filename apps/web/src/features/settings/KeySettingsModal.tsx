"use client";

import React, { useState } from "react";
import { X, Key, Check } from "lucide-react";
import { useWorkspaceStore, LLMConfig, TierConfig } from "../../store/workspaceStore";

interface KeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIER_METADATA = [
  {
    key: "mini" as const,
    title: "Mini (For fast, small tasks)",
    description: "Used for query optimization and search reranking.",
    color: "var(--accent-blue)",
  },
  {
    key: "medium" as const,
    title: "Medium (For interactive chat)",
    description: "Used for direct, grounded answer synthesis and chat responses.",
    color: "var(--status-success-text)",
  },
  {
    key: "high" as const,
    title: "High (For complex workspace files)",
    description: "Used for deep studio scripts, briefing reports, and study guides.",
    color: "var(--accent-orange)",
  },
];

export function KeySettingsModal({
  isOpen,
  onClose,
}: KeySettingsModalProps) {
  const {
    llmSettings,
    setLLMSettings,
  } = useWorkspaceStore();

  const [settings, setSettings] = useState<LLMConfig>({ ...llmSettings });

  if (!isOpen) return null;

  const handleTierChange = (tier: "mini" | "medium" | "high", key: keyof TierConfig, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [key]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLLMSettings(settings);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "600px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
              <Key size={20} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>Task-Based LLM Tiers</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Scrollable Form Area */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxHeight: "60vh",
            overflowY: "auto",
            paddingRight: "6px",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
            paddingTop: "14px",
            paddingBottom: "14px"
          }}>
            {TIER_METADATA.map((tier) => {
              const config = settings[tier.key] || {
                provider: "default",
                apiKey: "",
                modelId: "",
                baseUrl: "",
              };

              return (
                <div 
                  key={tier.key} 
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-canvas-subtle, #f9fafb)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Tier Title & Description */}
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: tier.color, marginBottom: "2px" }}>
                      {tier.title}
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                      {tier.description}
                    </p>
                  </div>

                  {/* Provider Dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Adapter / Model Provider
                    </label>
                    <select
                      value={config.provider}
                      onChange={(e) => handleTierChange(tier.key, "provider", e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-medium)",
                        backgroundColor: "var(--bg-canvas)",
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    >
                      <option value="default">Use Server Default Credentials</option>
                      <option value="google">Google Gemini Adapter</option>
                      <option value="openai">OpenAI GPT Adapter</option>
                      <option value="anthropic">Anthropic Claude Adapter</option>
                      <option value="other">Other (OpenRouter, Groq, Grok/xAI, etc.)</option>
                    </select>
                  </div>

                  {/* Conditionally Render Custom Form Fields if not default */}
                  {config.provider !== "default" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {config.provider === "other" && (
                        <div>
                          <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                            Base URL (Endpoint)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. https://openrouter.ai/api/v1"
                            value={config.baseUrl}
                            onChange={(e) => handleTierChange(tier.key, "baseUrl", e.target.value)}
                            style={{
                              width: "100%", padding: "6px 10px", borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-canvas)",
                              color: "var(--text-primary)", fontSize: "0.82rem", outline: "none"
                            }}
                          />
                        </div>
                      )}
                      
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                            API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter credentials key..."
                            value={config.apiKey}
                            onChange={(e) => handleTierChange(tier.key, "apiKey", e.target.value)}
                            style={{
                              width: "100%", padding: "6px 10px", borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-canvas)",
                              color: "var(--text-primary)", fontSize: "0.82rem", outline: "none"
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                            Model ID / Name
                          </label>
                          <input
                            type="text"
                            placeholder={
                              config.provider === "google" ? "e.g. gemini-2.0-flash" :
                              config.provider === "openai" ? "e.g. gpt-4o-mini" :
                              config.provider === "anthropic" ? "e.g. claude-3-5-haiku-20241022" :
                              "e.g. meta-llama/llama-3-8b-instruct"
                            }
                            value={config.modelId}
                            onChange={(e) => handleTierChange(tier.key, "modelId", e.target.value)}
                            style={{
                              width: "100%", padding: "6px 10px", borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-canvas)",
                              color: "var(--text-primary)", fontSize: "0.82rem", outline: "none"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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
