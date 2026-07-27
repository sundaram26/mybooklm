"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Copy, ThumbsUp, ThumbsDown, Pin } from "lucide-react";
import { api, ChatMessage } from "../../lib/api";
import { useChatHistory, useDocuments } from "../../lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { useWorkspaceStore } from "../../store/workspaceStore";

export function ChatInterface({ notebookId }: { notebookId: string }) {
  const queryClient = useQueryClient();
  const { data: dbHistory = [] } = useChatHistory(notebookId);
  const { data: documents = [] } = useDocuments(notebookId);
  const { data: session } = useSession();
  const user = session?.user;
  const isGuest = !user || (user as any).isAnonymous;

  const { llmSettings, incrementGuestTurn } = useWorkspaceStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      setMessages(prev => {
        // Prevent infinite re-renders by checking if the array contents actually changed
        if (prev.length === dbHistory.length && prev.every((m, i) => m.id === dbHistory[i]?.id && m.content?.length === dbHistory[i]?.content?.length)) {
          return prev;
        }
        return dbHistory;
      });
    }
  }, [dbHistory, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const SUGGESTIONS = ["Summarize sources", "Generate study guide", "List key concepts", "Formulate quiz questions"];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;
    setInput("");

    const tempUser: ChatMessage = { id: `temp-${Date.now()}`, sessionId: notebookId, role: "user", content: queryText, parentId: activeParentId, createdAt: new Date().toISOString() };
    const tempAssistant: ChatMessage = { id: `temp-a-${Date.now()}`, sessionId: notebookId, role: "assistant", content: "", parentId: tempUser.id, createdAt: new Date().toISOString() };

    setMessages(prev => [...prev, tempUser, tempAssistant]);
    setIsStreaming(true);
    if (isGuest) incrementGuestTurn();

    try {
      await api.streamChat(
        notebookId, queryText,
        { parentId: activeParentId, llmSettings },
        chunk => setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: m.content + chunk } : m)),
        () => { setIsStreaming(false); setActiveParentId(tempAssistant.id); queryClient.invalidateQueries({ queryKey: ["chatHistory", notebookId] }); },
        err => { setIsStreaming(false); setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: `Error: ${err.message}` } : m)); }
      );
    } catch (err: any) {
      setIsStreaming(false);
      setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: `Connection error: ${err.message}` } : m));
    }
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || "G";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-surface)" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={13} style={{ color: "var(--text-subtle)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>Chat</span>
        </div>
        <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>
          {documents.length} source{documents.length !== 1 ? "s" : ""} indexed
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
        {messages.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "480px" }}>
            <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px" }}>
              Topics in your sources come to life here.
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "6px", fontSize: "0.78rem", fontWeight: 500 }}>How to start:</p>
            <ul style={{ paddingLeft: "16px", color: "var(--text-muted)", fontSize: "0.78rem", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>Ask questions about your sources</li>
              <li>Type <code style={{ background: "var(--bg-canvas)", padding: "1px 4px", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", border: "1px solid var(--border-subtle)" }}>@</code> to reference specific sources</li>
              <li>Select a suggestion below to explore</li>
            </ul>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                maxWidth: "90%",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "var(--accent-orange)" : "var(--bg-canvas)",
                border: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.62rem", fontWeight: 700, color: msg.role === "user" ? "#fff" : "var(--text-muted)",
              }}>
                {msg.role === "user" ? userInitial : <Sparkles size={11} />}
              </div>

              {/* Bubble */}
              <div style={{
                borderRadius: "var(--radius-lg)",
                padding: "10px 14px",
                fontSize: "0.84rem", lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                background: msg.role === "user" ? "var(--bg-canvas)" : "transparent",
                border: msg.role === "user" ? "1px solid var(--border-subtle)" : "none",
                color: msg.role === "user" ? "var(--text-primary)" : "var(--text-secondary)",
              }}>
                {msg.content || (isStreaming ? (
                  <span style={{ display: "flex", gap: "3px", padding: "2px 0" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: "4px", height: "4px", borderRadius: "50%",
                        background: "var(--text-subtle)",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        display: "inline-block",
                      }} />
                    ))}
                  </span>
                ) : "")}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    {msg.citations.map((cite: any, idx: number) => (
                      <div key={idx} style={{
                        fontSize: "0.72rem", background: "var(--bg-canvas)",
                        padding: "6px 10px", borderRadius: "var(--radius-md)",
                        color: "var(--text-muted)", border: "1px solid var(--border-subtle)",
                      }}>
                        <strong style={{ color: "var(--text-secondary)" }}>[{cite.documentTitle}]:</strong>{" "}
                        "{cite.snippet}"
                      </div>
                    ))}
                  </div>
                )}

                {/* Action icons for AI messages */}
                {msg.role === "assistant" && !isStreaming && msg.content && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {[{ Icon: Pin }, { Icon: Copy }, { Icon: ThumbsUp }, { Icon: ThumbsDown }].map(({ Icon }, i) => (
                      <button key={i} style={{
                        padding: "3px", borderRadius: "var(--radius-sm)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-subtle)", display: "flex",
                        transition: "all var(--transition-fast)",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-subtle)"; }}
                      >
                        <Icon size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {!isStreaming && messages.length === 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "0 20px 10px", flexShrink: 0 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSendQuery(s)}
              style={{
                padding: "5px 12px", fontSize: "0.75rem", fontWeight: 500,
                background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)", borderRadius: "999px",
                cursor: "pointer", transition: "all var(--transition-fast)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: "10px 16px 14px", flexShrink: 0 }}>
        <form
          onSubmit={e => { e.preventDefault(); if (input.trim()) handleSendQuery(input.trim()); }}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "var(--bg-canvas)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", padding: "6px 6px 6px 14px",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-orange)"}
          onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"}
        >
          <input
            type="text"
            placeholder="Ask about your sources..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text-primary)", fontSize: "0.84rem",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{
              fontSize: "0.68rem", color: "var(--text-subtle)",
              padding: "2px 7px", borderRadius: "var(--radius-sm)",
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            }}>
              {documents.length} src
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: input.trim() && !isStreaming ? "var(--accent-orange)" : "var(--bg-surface)",
                border: "none", cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: input.trim() && !isStreaming ? "#fff" : "var(--text-subtle)",
                transition: "all var(--transition-fast)",
              }}
            >
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </form>
        <p style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--text-subtle)", marginTop: "6px" }}>
          AI can be inaccurate — double check responses.
        </p>
      </div>
    </div>
  );
}
