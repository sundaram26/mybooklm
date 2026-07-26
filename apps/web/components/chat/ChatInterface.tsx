"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, BookOpen, GitBranch, Key, AlertCircle } from "lucide-react";
import { api, ChatMessage } from "../../lib/api-client";

interface ChatInterfaceProps {
  notebookId: string;
  customApiKey?: string;
  customModelId?: string;
  isGuest?: boolean;
  onIncrementGuestTurn?: () => void;
}

export function ChatInterface({
  notebookId,
  customApiKey,
  customModelId,
  isGuest,
  onIncrementGuestTurn,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, [notebookId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const loadHistory = async () => {
    try {
      const history = await api.getChatHistory(notebookId);
      setMessages(history);
    } catch {
      // ignore
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userQuery = input.trim();
    setInput("");

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: notebookId,
      role: "user",
      content: userQuery,
      parentId: activeParentId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic assistant message placeholder
    const tempAssistantMsg: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      sessionId: notebookId,
      role: "assistant",
      content: "",
      parentId: tempUserMsg.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg]);
    setIsStreaming(true);

    if (isGuest && onIncrementGuestTurn) {
      onIncrementGuestTurn();
    }

    await api.streamChat(
      notebookId,
      userQuery,
      {
        parentId: activeParentId,
        customApiKey,
        modelId: customModelId,
      },
      (chunkText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMsg.id
              ? { ...msg, content: msg.content + chunkText }
              : msg
          )
        );
      },
      () => {
        setIsStreaming(false);
        setActiveParentId(tempAssistantMsg.id);
        loadHistory(); // Sync actual IDs from DB
      },
      (err) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMsg.id
              ? { ...msg, content: `Error generating synthesis: ${err.message}` }
              : msg
          )
        );
      }
    );
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "var(--bg-canvas)",
      position: "relative"
    }}>
      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.length === 0 ? (
          <div style={{
            margin: "auto",
            maxWidth: "480px",
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
              Grounded AI Synthesis
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Ask anything about your notebook sources. Answers are grounded strictly in your uploaded documents with source citations.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
                maxWidth: "85%",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row"
              }}
            >
              {/* Avatar */}
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: msg.role === "user" ? "var(--accent-blue)" : "var(--bg-surface-hover)",
                color: msg.role === "user" ? "#FFFFFF" : "var(--accent-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--shadow-sm)"
              }}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                backgroundColor: msg.role === "user" ? "var(--accent-blue)" : "var(--bg-surface)",
                color: msg.role === "user" ? "#FFFFFF" : "var(--text-primary)",
                border: msg.role === "user" ? "none" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "14px 18px",
                boxShadow: "var(--shadow-sm)",
                fontSize: "0.92rem",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {msg.content || (isStreaming ? "Thinking and searching sources..." : "")}

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>
                      <BookOpen size={12} />
                      <span>Grounded Citations</span>
                    </div>
                    {msg.citations.map((cite, idx) => (
                      <div key={idx} style={{ fontSize: "0.78rem", backgroundColor: "var(--bg-canvas-subtle)", padding: "6px 10px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>
                        <strong>[{cite.documentTitle}]</strong>: "{cite.snippet}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <input
          type="text"
          placeholder="Ask a question based on notebook sources..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-canvas)",
            color: "var(--text-primary)",
            fontSize: "0.92rem",
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="btn btn-primary"
          style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
