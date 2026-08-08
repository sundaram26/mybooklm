"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Copy, ThumbsUp, ThumbsDown, Pin } from "lucide-react";
import { api, ChatMessage } from "../../lib/api";
import { useChatHistory, useDocuments } from "../../lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { useWorkspaceStore } from "../../store/workspaceStore";

export function ChatInterface({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { data: dbHistory = [] } = useChatHistory(projectId);
  const { data: documents = [] } = useDocuments(projectId);
  const { data: session } = useSession();
  const user = session?.user;
  const isGuest = !user || (user as any).isAnonymous;

  const { incrementGuestTurn, selectedModelId } = useWorkspaceStore();
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
      // Set activeParentId to the last message ID in database history
      if (dbHistory.length > 0) {
        const lastMsg = dbHistory[dbHistory.length - 1];
        if (lastMsg) {
          setActiveParentId(lastMsg.id);
        }
      } else {
        setActiveParentId(undefined);
      }
    }
  }, [dbHistory, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const SUGGESTIONS = ["Summarize sources", "Generate study guide", "List key concepts", "Formulate quiz questions"];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;
    setInput("");

    const tempUser: ChatMessage = { id: `temp-${Date.now()}`, sessionId: projectId, role: "user", content: queryText, parentId: activeParentId, createdAt: new Date().toISOString() };
    const tempAssistant: ChatMessage = { id: `temp-a-${Date.now()}`, sessionId: projectId, role: "assistant", content: "", parentId: tempUser.id, createdAt: new Date().toISOString() };

    setMessages(prev => [...prev, tempUser, tempAssistant]);
    setIsStreaming(true);
    if (isGuest) incrementGuestTurn();

    try {
      await api.streamChat(
        projectId, queryText,
        { parentId: activeParentId, selectedModelId },
        chunk => setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: m.content + chunk } : m)),
        (fullText, metadata) => {
          setIsStreaming(false);
          if (metadata?.messageId) {
            setActiveParentId(metadata.messageId);
          } else {
            setActiveParentId(tempAssistant.id);
          }
          queryClient.invalidateQueries({ queryKey: ["chatHistory", projectId] });
        },
        err => { setIsStreaming(false); setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: `Error: ${err.message}` } : m)); }
      );
    } catch (err: any) {
      setIsStreaming(false);
      setMessages(prev => prev.map(m => m.id === tempAssistant.id ? { ...m, content: `Connection error: ${err.message}` } : m));
    }
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || "G";

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-[10px] border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-[6px]">
          <Sparkles size={13} className="text-[var(--text-subtle)]" />
          <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">Chat</span>
        </div>
        <span className="text-[0.68rem] text-[var(--text-subtle)]">
          {documents.length} source{documents.length !== 1 ? "s" : ""} indexed
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 flex flex-col gap-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-[var(--text-secondary)] text-[0.875rem] leading-[1.6] max-w-[480px]">
            <p className="text-[1rem] font-medium text-[var(--text-primary)] mb-3">
              Topics in your sources come to life here.
            </p>
            <p className="text-[var(--text-muted)] mb-[6px] text-[0.78rem] font-medium">How to start:</p>
            <ul className="pl-4 text-[var(--text-muted)] text-[0.78rem] flex flex-col gap-1 list-disc">
              <li>Ask questions about your sources</li>
              <li>Type <code className="bg-[var(--bg-canvas)] px-1 py-[1px] rounded-[var(--radius-sm)] text-[0.72rem] border border-[var(--border-subtle)]">@</code> to reference specific sources</li>
              <li>Select a suggestion below to explore</li>
            </ul>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-[10px] items-start max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full shrink-0 border border-[var(--border-subtle)] flex items-center justify-center text-[0.62rem] font-bold ${msg.role === 'user' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]' : 'bg-[var(--bg-canvas)] text-[var(--text-muted)]'}`}>
                {msg.role === "user" ? userInitial : <Sparkles size={11} />}
              </div>

              {/* Bubble */}
              <div className={`rounded-[var(--radius-lg)] px-[14px] py-[10px] text-[0.84rem] leading-[1.6] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]' : 'bg-transparent border-none text-[var(--text-secondary)]'}`}>
                {msg.content || (isStreaming ? (
                  <span className="flex gap-[3px] py-[2px]">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1 h-1 rounded-full bg-[var(--text-subtle)] inline-block"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </span>
                ) : "")}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-[10px] flex flex-col gap-[5px]">
                    {msg.citations.map((cite: any, idx: number) => (
                      <div key={idx} className="text-[0.72rem] bg-[var(--bg-canvas)] px-[10px] py-[6px] rounded-[var(--radius-md)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        <strong className="text-[var(--text-secondary)]">[{cite.documentTitle}]:</strong>{" "}
                        "{cite.snippet}"
                      </div>
                    ))}
                  </div>
                )}

                {/* Action icons for AI messages */}
                {msg.role === "assistant" && !isStreaming && msg.content && (
                  <div className="flex gap-1 mt-2">
                    {[{ Icon: Pin }, { Icon: Copy }, { Icon: ThumbsUp }, { Icon: ThumbsDown }].map(({ Icon }, i) => (
                      <button key={i} className="p-[3px] rounded-[var(--radius-sm)] bg-transparent border-none cursor-pointer text-[var(--text-subtle)] flex transition-all hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]">
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
        <div className="flex flex-wrap gap-[6px] px-5 pb-[10px] shrink-0">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSendQuery(s)}
              className="px-3 py-[5px] text-[0.75rem] font-medium bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-full cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pt-[10px] pb-[14px] shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); if (input.trim()) handleSendQuery(input.trim()); }}
          className="group flex items-center gap-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] pl-[14px] pr-[6px] py-[6px] transition-colors focus-within:border-[var(--accent-orange)]"
        >
          <input
            type="text"
            placeholder="Ask about your sources..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-[0.84rem]"
          />
          <div className="flex items-center gap-[6px] shrink-0">
            <span className="text-[0.68rem] text-[var(--text-subtle)] px-[7px] py-[2px] rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              {documents.length} src
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border-none ${input.trim() && !isStreaming ? 'bg-[var(--accent-orange)] text-white cursor-pointer' : 'bg-[var(--bg-surface)] text-[var(--text-subtle)] cursor-not-allowed'}`}
            >
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </form>
        <p className="text-center text-[0.65rem] text-[var(--text-subtle)] mt-[6px]">
          AI can be inaccurate — double check responses.
        </p>
      </div>
    </div>
  );
}
