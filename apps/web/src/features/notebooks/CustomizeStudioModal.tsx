import React, { useState } from "react";
import { X, Play, HelpCircle, Sparkles, Check, ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useGenerateStudio } from "../../lib/hooks";

export function CustomizeStudioModal({
  isOpen,
  feature,
  onClose
}: {
  isOpen: boolean;
  feature: string | null;
  onClose: () => void;
}) {
  const { selectedNotebook, setSelectedDocumentId, setCenterPanelMode, llmSettings } = useWorkspaceStore();
  const notebookId = selectedNotebook?.id || "";
  
  const generateStudioMutation = useGenerateStudio(notebookId);

  // Customize states
  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<"fewer" | "standard" | "more">("standard");
  const [quizDifficulty, setQuizDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quizTopic, setQuizTopic] = useState("");

  // Audio Overview
  const [audioFormat, setAudioFormat] = useState<"deep-dive" | "brief" | "critique" | "debate">("deep-dive");
  const [audioLanguage, setAudioLanguage] = useState("English");
  const [audioLength, setAudioLength] = useState<"short" | "default" | "long">("default");
  const [audioFocus, setAutoFocus] = useState("");

  // Generic/Other Customizations
  const [genericTopic, setGenericTopic] = useState("");

  if (!isOpen || !feature) return null;

  const handleGenerate = async () => {
    let customParams: Record<string, any> = {};
    if (feature === "quiz") {
      customParams = {
        numQuestions: quizQuestions,
        difficulty: quizDifficulty,
        topic: quizTopic
      };
    } else if (feature === "audio-overview") {
      customParams = {
        format: audioFormat,
        language: audioLanguage,
        length: audioLength,
        focus: audioFocus
      };
    } else {
      customParams = {
        topic: genericTopic
      };
    }

    try {
      const doc = await generateStudioMutation.mutateAsync({
        feature,
        llmSettings,
        customParams
      });
      setSelectedDocumentId(doc.id);
      if (doc.studioFeature) {
        setCenterPanelMode("studio");
      }
      onClose();
    } catch (err) {
      alert("Failed to generate studio content: " + (err as Error).message);
    }
  };

  const renderQuizCustomizer = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          {/* Number of Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>Number of Questions</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { value: "fewer", label: "Fewer" },
                { value: "standard", label: "Standard (Default)" },
                { value: "more", label: "More" }
              ].map(opt => {
                const isSelected = quizQuestions === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setQuizQuestions(opt.value as any)}
                    style={{
                      padding: "6px 14px", fontSize: "0.76rem", fontWeight: 500,
                      borderRadius: "999px", border: "1px solid " + (isSelected ? "#4F46E5" : "#3F3F46"),
                      background: isSelected ? "rgba(79, 70, 229, 0.15)" : "transparent",
                      color: isSelected ? "#A5B4FC" : "#D4D4D8", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level of Difficulty */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>Level of Difficulty</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium (Default)" },
                { value: "hard", label: "Hard" }
              ].map(opt => {
                const isSelected = quizDifficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setQuizDifficulty(opt.value as any)}
                    style={{
                      padding: "6px 14px", fontSize: "0.76rem", fontWeight: 500,
                      borderRadius: "999px", border: "1px solid " + (isSelected ? "#4F46E5" : "#3F3F46"),
                      background: isSelected ? "rgba(79, 70, 229, 0.15)" : "transparent",
                      color: isSelected ? "#A5B4FC" : "#D4D4D8", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>What should the topic be?</span>
          <div style={{
            position: "relative",
            background: "#09090B",
            border: "1px solid #27272A",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            minHeight: "150px",
            display: "flex",
            flexDirection: "column"
          }}>
            <textarea
              placeholder="e.g., Focus solely on key concepts of physics, or prepare for history exam on Ancient Egypt..."
              value={quizTopic}
              onChange={e => setQuizTopic(e.target.value)}
              style={{
                flex: 1, width: "100%", height: "100%", background: "none", border: "none",
                outline: "none", color: "#F4F4F5", resize: "none", fontSize: "0.82rem",
                fontFamily: "var(--font-sans)", lineHeight: 1.5
              }}
            />
            {quizTopic.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "#71717A", marginTop: "12px", borderTop: "1px solid #18181B", paddingTop: "8px" }}>
                <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Things to try</span>
                <ul style={{ paddingLeft: "14px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <li>Create a quiz to help me prepare for my history exam on Ancient Egypt</li>
                  <li>The quiz must have 30 questions (maximum of 50 questions allowed)</li>
                  <li>The quiz must be restricted to a specific source (e.g. "the article about Italy")</li>
                  <li>The quiz must focus solely on the key concepts of physics</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAudioCustomizer = () => {
    const formats = [
      { id: "deep-dive", title: "Deep Dive", desc: "A lively conversation between two hosts, unpacking and connecting topics in your sources" },
      { id: "brief", title: "Brief", desc: "A bite-sized overview to help you grasp the core ideas from your sources quickly" },
      { id: "critique", title: "Critique", desc: "An expert review of your sources, offering constructive feedback to help you improve your material" },
      { id: "debate", title: "Debate", desc: "A thoughtful debate between two hosts, illuminating different perspectives on your sources" }
    ];

    const languages = ["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Portuguese", "Japanese"];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Format selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>Format</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
            {formats.map(f => {
              const isSelected = audioFormat === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setAudioFormat(f.id as any)}
                  style={{
                    background: isSelected ? "rgba(79, 70, 229, 0.08)" : "#09090B",
                    border: `1px solid ${isSelected ? "#4F46E5" : "#27272A"}`,
                    borderRadius: "var(--radius-lg)", padding: "12px 14px",
                    cursor: "pointer", transition: "all var(--transition-fast)",
                    display: "flex", flexDirection: "column", gap: "4px", position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: isSelected ? "#A5B4FC" : "#F4F4F5" }}>{f.title}</span>
                    {isSelected && <Check size={12} style={{ color: "#A5B4FC" }} />}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#9A9A8B", lineHeight: 1.3 }}>{f.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          {/* Choose Language */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "160px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>Choose language</span>
            <div style={{ position: "relative" }}>
              <select
                value={audioLanguage}
                onChange={e => setAudioLanguage(e.target.value)}
                style={{
                  width: "100%", padding: "6px 12px 6px 12px", background: "#09090B",
                  border: "1px solid #27272A", borderRadius: "var(--radius-md)",
                  color: "#F4F4F5", fontSize: "0.76rem", outline: "none", cursor: "pointer",
                  appearance: "none"
                }}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown size={12} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#71717A" }} />
            </div>
          </div>

          {/* Length */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>Length</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { value: "short", label: "Short" },
                { value: "default", label: "Default" },
                { value: "long", label: "Long" }
              ].map(opt => {
                const isSelected = audioLength === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAudioLength(opt.value as any)}
                    style={{
                      padding: "6px 14px", fontSize: "0.76rem", fontWeight: 500,
                      borderRadius: "999px", border: "1px solid " + (isSelected ? "#4F46E5" : "#3F3F46"),
                      background: isSelected ? "rgba(79, 70, 229, 0.15)" : "transparent",
                      color: isSelected ? "#A5B4FC" : "#D4D4D8", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focus Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>What should the AI hosts focus on in this episode?</span>
          <div style={{
            position: "relative",
            background: "#09090B",
            border: "1px solid #27272A",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            minHeight: "130px",
            display: "flex",
            flexDirection: "column"
          }}>
            <textarea
              placeholder="e.g. Focus on a specific source, target a specific audience, or discuss main characters..."
              value={audioFocus}
              onChange={e => setAutoFocus(e.target.value)}
              style={{
                flex: 1, width: "100%", height: "100%", background: "none", border: "none",
                outline: "none", color: "#F4F4F5", resize: "none", fontSize: "0.82rem",
                fontFamily: "var(--font-sans)", lineHeight: 1.5
              }}
            />
            {audioFocus.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "#71717A", marginTop: "12px", borderTop: "1px solid #18181B", paddingTop: "8px" }}>
                <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Things to try</span>
                <ul style={{ paddingLeft: "14px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <li>Focus on a specific source ("only cover the article about Italy")</li>
                  <li>Focus on a specific topic ("just discuss the novel's main character")</li>
                  <li>Target a specific audience ("explain to someone new to biology")</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGenericCustomizer = () => {
    const titleLabel = feature.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E4E4E7" }}>What should the focus of the {titleLabel} be?</span>
          <textarea
            placeholder={`e.g., Focus specifically on main themes, key dates, or specific target details...`}
            value={genericTopic}
            onChange={e => setGenericTopic(e.target.value)}
            style={{
              width: "100%", height: "150px", background: "#09090B", border: "1px solid #27272A",
              borderRadius: "var(--radius-lg)", padding: "16px", color: "#F4F4F5", outline: "none",
              resize: "none", fontSize: "0.82rem", fontFamily: "var(--font-sans)", lineHeight: 1.5
            }}
          />
        </div>
      </div>
    );
  };

  const getFeatureTitle = () => {
    if (feature === "quiz") return "Customize Quiz";
    if (feature === "audio-overview") return "Customize Audio Overview";
    return `Customize ${feature.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(9, 9, 11, 0.8)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "var(--radius-xl)",
        width: "100%",
        maxWidth: "680px",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #27272A"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F4F4F5" }}>
            <Sparkles size={16} style={{ color: "#A5B4FC" }} />
            <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>{getFeatureTitle()}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center",
              padding: "4px", borderRadius: "50%", transition: "all var(--transition-fast)"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#27272A"; (e.currentTarget as HTMLElement).style.color = "#F4F4F5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#71717A"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "calc(80vh - 120px)" }}>
          {feature === "quiz" && renderQuizCustomizer()}
          {feature === "audio-overview" && renderAudioCustomizer()}
          {feature !== "quiz" && feature !== "audio-overview" && renderGenericCustomizer()}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "10px",
          padding: "16px 24px", borderTop: "1px solid #27272A", background: "#111115"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px", fontSize: "0.78rem", fontWeight: 600,
              background: "transparent", border: "1px solid #3F3F46", borderRadius: "999px",
              color: "#D4D4D8", cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generateStudioMutation.isPending}
            style={{
              padding: "8px 20px", fontSize: "0.78rem", fontWeight: 600,
              background: "#4F46E5", border: "none", borderRadius: "999px",
              color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            {generateStudioMutation.isPending ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
