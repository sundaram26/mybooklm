import React, { useState } from "react";
import { 
  Sparkles, CheckCircle2, XCircle, ArrowLeft, ArrowRight, 
  RotateCcw, HelpCircle, BookOpen, Layers, Play, 
  Map, Layout, Presentation, Table as TableIcon, Info
} from "lucide-react";
import { DocumentItem } from "../../lib/api";

export function StudioContentViewer({ doc }: { doc: DocumentItem & { content?: string } }) {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  let data: any = null;
  let isFallback = false;

  try {
    if (doc.content) {
      data = JSON.parse(doc.content);
    }
  } catch (e) {
    console.error("Failed to parse studio document content as JSON", e);
    isFallback = true;
  }

  if (isFallback || !data) {
    return (
      <div style={{ padding: "24px", overflowY: "auto", height: "100%", color: "var(--text-secondary)" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
          {doc.title}
        </h3>
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", lineHeight: "1.6" }}>
          {doc.content}
        </div>
      </div>
    );
  }

  const renderQuiz = () => {
    const questions = data.questions || [];
    const score = questions.reduce((acc: number, q: any) => {
      return acc + (quizAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Test your understanding of the source materials</p>
          </div>
          {showQuizResults && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", padding: "6px 12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Score: {score} / {questions.length}
              </span>
              <span style={{ fontSize: "0.72rem", color: score / questions.length >= 0.7 ? "var(--status-success-text)" : "var(--status-warning-text)" }}>
                ({Math.round((score / questions.length) * 100)}%)
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {questions.map((q: any, idx: number) => {
            const selected = quizAnswers[q.id];
            const isCorrect = selected === q.correctAnswer;
            
            return (
              <div 
                key={q.id} 
                style={{ 
                  background: "var(--bg-canvas)", 
                  border: "1px solid " + (showQuizResults ? (isCorrect ? "var(--status-success-text)" : "var(--status-error-text)") : "var(--border-subtle)"),
                  borderRadius: "var(--radius-lg)", 
                  padding: "16px",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ 
                    width: "20px", height: "20px", borderRadius: "50%", 
                    background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.4 }}>
                      {q.question}
                    </p>

                    {q.type === "short-answer" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input 
                          type="text" 
                          placeholder="Type your answer here..."
                          value={selected || ""}
                          onChange={(e) => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          disabled={showQuizResults}
                          style={{
                            width: "100%", padding: "8px 12px", fontSize: "0.82rem",
                            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                          }}
                        />
                        {showQuizResults && (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            <strong>Suggested Answer:</strong> {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {q.options?.map((opt: string) => {
                          const optionCode = opt.match(/^([A-D])\)/)?.[1] || opt;
                          const isOptionSelected = selected === optionCode || selected === opt;
                          const isOptionCorrect = q.correctAnswer === optionCode || q.correctAnswer === opt;
                          
                          let optBg = "var(--bg-surface)";
                          let optBorder = "var(--border-subtle)";
                          if (isOptionSelected) {
                            optBg = showQuizResults ? (isCorrect ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)") : "var(--bg-surface-hover)";
                            optBorder = showQuizResults ? (isCorrect ? "var(--status-success-text)" : "var(--status-error-text)") : "var(--accent-orange)";
                          } else if (showQuizResults && isOptionCorrect) {
                            optBg = "rgba(16, 185, 129, 0.1)";
                            optBorder = "var(--status-success-text)";
                          }

                          return (
                            <div 
                              key={opt}
                              onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [q.id]: optionCode }))}
                              style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 12px", borderRadius: "var(--radius-md)",
                                background: optBg, border: `1px solid ${optBorder}`,
                                cursor: showQuizResults ? "default" : "pointer", fontSize: "0.8rem",
                                color: "var(--text-secondary)", transition: "all var(--transition-fast)"
                              }}
                            >
                              <div style={{
                                width: "14px", height: "14px", borderRadius: "50%",
                                border: `1px solid ${isOptionSelected ? "var(--accent-orange)" : "var(--border-subtle)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: isOptionSelected ? "var(--accent-orange)" : "transparent",
                                flexShrink: 0
                              }}>
                                {isOptionSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {showQuizResults && (
                      <div style={{ marginTop: "12px", padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", borderLeft: `3px solid ${isCorrect ? "var(--status-success-text)" : "var(--status-error-text)"}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 700, color: isCorrect ? "var(--status-success-text)" : "var(--status-error-text)", marginBottom: "4px" }}>
                          {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isCorrect ? "Correct" : "Incorrect"}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          {showQuizResults ? (
            <button 
              onClick={() => { setQuizAnswers({}); setShowQuizResults(false); }}
              className="btn btn-ghost"
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid var(--border-subtle)" }}
            >
              <RotateCcw size={14} />
              Reset Quiz
            </button>
          ) : (
            <button 
              onClick={() => setShowQuizResults(true)}
              className="btn btn-primary"
              disabled={Object.keys(quizAnswers).length < questions.length}
              style={{ background: "var(--accent-orange)", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <CheckCircle2 size={14} />
              Submit Answers
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFlashcards = () => {
    const cards = data.cards || [];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Flip cards to review key concepts</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {cards.map((card: any, idx: number) => {
            const isFlipped = flippedCards[idx];
            return (
              <div 
                key={idx}
                onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !isFlipped }))}
                style={{
                  height: "160px",
                  perspective: "1000px",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.6s",
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "none",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  background: isFlipped ? "var(--bg-canvas-subtle)" : "var(--bg-canvas)"
                }}>
                  {/* Front */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "16px",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.86rem"
                  }}>
                    <span style={{ fontSize: "0.62rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "8px" }}>Concept</span>
                    {card.front}
                  </div>

                  {/* Back */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "16px",
                    color: "var(--text-secondary)",
                    transform: "rotateY(180deg)",
                    fontSize: "0.78rem",
                    lineHeight: 1.4
                  }}>
                    <span style={{ fontSize: "0.62rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "8px" }}>Definition</span>
                    {card.back}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSlideDeck = () => {
    const slides = data.slides || [];
    const activeSlide = slides[currentSlide];

    if (!activeSlide) return <p>No slides found.</p>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Interactive slide presentation outline</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              disabled={currentSlide === 0} 
              onClick={() => setCurrentSlide(prev => prev - 1)}
              style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", cursor: currentSlide === 0 ? "not-allowed" : "pointer" }}
            >
              <ArrowLeft size={14} />
            </button>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {currentSlide + 1} / {slides.length}
            </span>
            <button 
              disabled={currentSlide === slides.length - 1} 
              onClick={() => setCurrentSlide(prev => prev + 1)}
              style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", cursor: currentSlide === slides.length - 1 ? "not-allowed" : "pointer" }}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          background: "var(--bg-canvas)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
          minHeight: "260px"
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--accent-orange)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Slide {activeSlide.slideNumber}
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
              {activeSlide.title}
            </h2>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              {activeSlide.bulletPoints?.map((pt: string, i: number) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {activeSlide.notes && (
            <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "24px", paddingTop: "12px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", marginBottom: "4px" }}>Speaker Notes</div>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
                {activeSlide.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const sections = data.sections || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Briefing Report</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((sec: any, i: number) => (
            <div key={i} style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "16px" }}>
              <h4 style={{ fontSize: "0.94rem", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", marginBottom: "10px" }}>
                {sec.heading}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAudioOverview = () => {
    const transcript = data.transcript || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Overview Script featuring: {data.hosts?.join(", ")}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--bg-canvas-subtle)", padding: "16px", borderRadius: "var(--radius-lg)" }}>
          {transcript.map((line: any, i: number) => {
            const isHostA = line.speaker?.toLowerCase().includes("a") || i % 2 === 0;
            return (
              <div 
                key={i} 
                style={{ 
                  display: "flex", 
                  flexDirection: isHostA ? "row" : "row-reverse", 
                  alignItems: "flex-start", 
                  gap: "10px" 
                }}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: isHostA ? "var(--accent-orange)" : "var(--accent-blue)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.68rem", fontWeight: 700, flexShrink: 0
                }}>
                  {line.speaker?.charAt(0).toUpperCase()}
                </div>
                <div style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  maxWidth: "75%",
                  fontSize: "0.8rem",
                  lineHeight: 1.4,
                  color: "var(--text-secondary)"
                }}>
                  <strong style={{ display: "block", fontSize: "0.7rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {line.speaker}
                  </strong>
                  {line.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVideoOverview = () => {
    const scenes = data.scenes || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Scene Storyboard outline</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {scenes.map((scene: any, i: number) => (
            <div key={i} style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ background: "var(--bg-canvas-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "8px 16px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Scene {scene.sceneNumber || (i + 1)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px" }}>
                <div style={{ borderRight: "1px solid var(--border-subtle)", paddingRight: "16px" }}>
                  <div style={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>Visual Storyboard</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{scene.visual}</p>
                </div>
                <div>
                  <div style={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>Audio/Voiceover</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{scene.audio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMindMap = () => {
    const nodes = data.nodes || [];
    const mainNode = nodes.find((n: any) => !n.parentId);
    const getChildren = (id: string) => nodes.filter((n: any) => n.parentId === id);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Hierarchical Mind Map Outline</p>
        </div>
        <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {mainNode && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%" }}>
              <div style={{ background: "var(--accent-orange)", color: "#fff", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "0.9rem", boxShadow: "var(--shadow-sm)" }}>
                {mainNode.label}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "16px", width: "100%" }}>
                {getChildren(mainNode.id).map((subNode: any) => (
                  <div key={subNode.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", border: "1px dashed var(--border-subtle)", padding: "12px", borderRadius: "var(--radius-lg)", minWidth: "160px", background: "var(--bg-surface)" }}>
                    <div style={{ background: "var(--bg-canvas-subtle)", border: "1px solid var(--border-subtle)", padding: "6px 12px", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {subNode.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                      {getChildren(subNode.id).map((childNode: any) => (
                        <div key={childNode.id} style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", color: "var(--text-secondary)", textAlign: "center" }}>
                          {childNode.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInfographic = () => {
    const sections = data.sections || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Infographic Layout & Visual Highlights</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {sections.map((sec: any, i: number) => (
            <div key={i} style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>
                {i + 1}
              </div>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>{sec.title}</h4>
              <div style={{ background: "var(--bg-surface)", padding: "8px 12px", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent-orange)", fontSize: "0.84rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                {sec.dataPoint}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                <strong>Visual Idea:</strong> {sec.visualIdea}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    const headers = data.headers || [];
    const rows = data.rows || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.title}</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Structured Workspace Data</p>
        </div>
        <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", background: "var(--bg-canvas)", boxShadow: "var(--shadow-sm)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-canvas-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                {headers.map((h: string, idx: number) => (
                  <th key={idx} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], rowIdx: number) => (
                <tr key={rowIdx} style={{ borderBottom: rowIdx === rows.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                  {row.map((val: string, valIdx: number) => (
                    <td key={valIdx} style={{ padding: "12px 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (data.type || doc.studioFeature) {
      case "quiz":
        return renderQuiz();
      case "flashcards":
        return renderFlashcards();
      case "slide-deck":
        return renderSlideDeck();
      case "reports":
        return renderReports();
      case "audio-overview":
        return renderAudioOverview();
      case "video-overview":
        return renderVideoOverview();
      case "mind-map":
        return renderMindMap();
      case "infographic":
        return renderInfographic();
      case "data-table":
        return renderDataTable();
      default:
        return (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize: "0.84rem" }}>
            {JSON.stringify(data, null, 2)}
          </div>
        );
    }
  };

  const getFeatureIcon = () => {
    switch (data.type || doc.studioFeature) {
      case "quiz": return <HelpCircle size={16} />;
      case "flashcards": return <Layers size={16} />;
      case "slide-deck": return <Presentation size={16} />;
      case "reports": return <BookOpen size={16} />;
      case "audio-overview": return <Play size={16} />;
      case "video-overview": return <Play size={16} />;
      case "mind-map": return <Map size={16} />;
      case "infographic": return <Layout size={16} />;
      case "data-table": return <TableIcon size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-surface)" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <div style={{ color: "var(--accent-orange)" }}>
          {getFeatureIcon()}
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
          {data.title || doc.title}
        </span>
      </div>

      {/* Main Workspace Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
