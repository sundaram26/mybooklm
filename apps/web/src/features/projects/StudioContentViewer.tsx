import React, { useState } from "react";
import { 
  Sparkles, CheckCircle2, XCircle, ArrowLeft, ArrowRight, 
  RotateCcw, HelpCircle, BookOpen, Layers, Play, 
  Map, Layout, Presentation, Table as TableIcon, Info
} from "lucide-react";
import { DocumentItem } from "@repo/shared";

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
      <div className="p-6 overflow-y-auto h-full text-[var(--text-secondary)]">
        <h3 className="text-[1.2rem] font-semibold text-[var(--text-primary)] mb-4">
          {doc.title}
        </h3>
        <div className="whitespace-pre-wrap font-[family-name:var(--font-sans)] leading-[1.6]">
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
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
            <p className="text-[0.78rem] text-[var(--text-muted)]">Test your understanding of the source materials</p>
          </div>
          {showQuizResults && (
            <div className="flex items-center gap-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-3 py-[6px] rounded-[var(--radius-md)]">
              <span className="text-[0.85rem] font-semibold text-[var(--text-primary)]">
                Score: {score} / {questions.length}
              </span>
              <span className={`text-[0.72rem] ${score / questions.length >= 0.7 ? 'text-[var(--status-success-text)]' : 'text-[var(--status-warning-text)]'}`}>
                ({Math.round((score / questions.length) * 100)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {questions.map((q: any, idx: number) => {
            const selected = quizAnswers[q.id];
            const isCorrect = selected === q.correctAnswer;
            
            return (
              <div 
                key={q.id} 
                className={`bg-[var(--bg-canvas)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)] border ${showQuizResults ? (isCorrect ? "border-[var(--status-success-text)]" : "border-[var(--status-error-text)]") : "border-[var(--border-subtle)]"}`}
              >
                <div className="flex items-start gap-[10px]">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[0.7rem] font-bold text-[var(--text-muted)] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[0.88rem] font-semibold text-[var(--text-primary)] mb-3 leading-[1.4]">
                      {q.question}
                    </p>

                    {q.type === "short-answer" ? (
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="Type your answer here..."
                          value={selected || ""}
                          onChange={(e) => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          disabled={showQuizResults}
                          className="w-full px-3 py-2 text-[0.82rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] outline-none"
                        />
                        {showQuizResults && (
                          <div className="text-[0.8rem] text-[var(--text-muted)] mt-1">
                            <strong>Suggested Answer:</strong> {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {q.options?.map((opt: string) => {
                          const optionCode = opt.match(/^([A-D])\)/)?.[1] || opt;
                          const isOptionSelected = selected === optionCode || selected === opt;
                          const isOptionCorrect = q.correctAnswer === optionCode || q.correctAnswer === opt;
                          
                          let optBg = "bg-[var(--bg-surface)]";
                          let optBorder = "border-[var(--border-subtle)]";
                          if (isOptionSelected) {
                            optBg = showQuizResults ? (isCorrect ? "bg-[rgba(16,185,129,0.1)]" : "bg-[rgba(239,68,68,0.1)]") : "bg-[var(--bg-surface-hover)]";
                            optBorder = showQuizResults ? (isCorrect ? "border-[var(--status-success-text)]" : "border-[var(--status-error-text)]") : "border-[var(--accent-orange)]";
                          } else if (showQuizResults && isOptionCorrect) {
                            optBg = "bg-[rgba(16,185,129,0.1)]";
                            optBorder = "border-[var(--status-success-text)]";
                          }

                          return (
                            <div 
                              key={opt}
                              onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [q.id]: optionCode }))}
                              className={`flex items-center gap-2 px-3 py-[10px] rounded-[var(--radius-md)] border ${optBg} ${optBorder} text-[0.8rem] text-[var(--text-secondary)] transition-all ${showQuizResults ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className={`w-[14px] h-[14px] rounded-full border flex items-center justify-center shrink-0 ${isOptionSelected ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)]' : 'border-[var(--border-subtle)] bg-transparent'}`}>
                                {isOptionSelected && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {showQuizResults && (
                      <div className={`mt-3 px-3 py-[10px] rounded-[var(--radius-md)] bg-[var(--bg-surface)] border-l-[3px] ${isCorrect ? 'border-l-[var(--status-success-text)]' : 'border-l-[var(--status-error-text)]'}`}>
                        <div className={`flex items-center gap-[6px] text-[0.75rem] font-bold mb-1 ${isCorrect ? 'text-[var(--status-success-text)]' : 'text-[var(--status-error-text)]'}`}>
                          {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isCorrect ? "Correct" : "Incorrect"}
                        </div>
                        <p className="text-[0.75rem] text-[var(--text-muted)] leading-[1.4]">
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

        <div className="flex justify-end gap-[10px] mt-3 border-t border-[var(--border-subtle)] pt-4">
          {showQuizResults ? (
            <button 
              onClick={() => { setQuizAnswers({}); setShowQuizResults(false); }}
              className="flex items-center gap-[6px] border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] px-4 py-2 rounded-[var(--radius-md)] cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Quiz
            </button>
          ) : (
            <button 
              onClick={() => setShowQuizResults(true)}
              disabled={Object.keys(quizAnswers).length < questions.length}
              className="flex items-center gap-[6px] bg-[var(--accent-orange)] border-none text-white px-4 py-2 rounded-[var(--radius-md)] cursor-pointer disabled:opacity-50"
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Flip cards to review key concepts</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {cards.map((card: any, idx: number) => {
            const isFlipped = flippedCards[idx];
            return (
              <div 
                key={idx}
                onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !isFlipped }))}
                className="h-[160px] cursor-pointer"
                style={{ perspective: "1000px" }}
              >
                <div className={`relative w-full h-full text-center transition-transform duration-600 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] ${isFlipped ? 'bg-[var(--bg-canvas-subtle)]' : 'bg-[var(--bg-canvas)]'}`}
                     style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "none" }}>
                  {/* Front */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-[var(--text-primary)] font-semibold text-[0.86rem]"
                       style={{ backfaceVisibility: "hidden" }}>
                    <span className="text-[0.62rem] uppercase text-[var(--text-muted)] tracking-[0.05em] mb-2">Concept</span>
                    {card.front}
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-[var(--text-secondary)] text-[0.78rem] leading-[1.4]"
                       style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <span className="text-[0.62rem] uppercase text-[var(--text-muted)] tracking-[0.05em] mb-2">Definition</span>
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
      <div className="flex flex-col gap-5 h-full">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
            <p className="text-[0.78rem] text-[var(--text-muted)]">Interactive slide presentation outline</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentSlide === 0} 
              onClick={() => setCurrentSlide(prev => prev - 1)}
              className="px-2 py-1 bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={14} />
            </button>
            <span className="text-[0.75rem] text-[var(--text-muted)]">
              {currentSlide + 1} / {slides.length}
            </span>
            <button 
              disabled={currentSlide === slides.length - 1} 
              onClick={() => setCurrentSlide(prev => prev + 1)}
              className="px-2 py-1 bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-9 flex flex-col justify-between shadow-[var(--shadow-sm)] min-h-[260px]">
          <div>
            <div className="text-[0.7rem] text-[var(--accent-orange)] font-semibold uppercase tracking-[0.05em] mb-2">
              Slide {activeSlide.slideNumber}
            </div>
            <h2 className="text-[1.4rem] font-bold text-[var(--text-primary)] mb-5">
              {activeSlide.title}
            </h2>
            <ul className="flex flex-col gap-[10px] pl-5 text-[var(--text-secondary)] text-[0.9rem] leading-[1.5] list-disc">
              {activeSlide.bulletPoints?.map((pt: string, i: number) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {activeSlide.notes && (
            <div className="border-t border-[var(--border-subtle)] mt-6 pt-3">
              <div className="text-[0.68rem] font-semibold text-[var(--text-subtle)] uppercase mb-1">Speaker Notes</div>
              <p className="text-[0.76rem] text-[var(--text-muted)] italic leading-[1.4]">
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Briefing Report</p>
        </div>
        <div className="flex flex-col gap-4">
          {sections.map((sec: any, i: number) => (
            <div key={i} className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h4 className="text-[0.94rem] font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 mb-[10px]">
                {sec.heading}
              </h4>
              <p className="text-[0.82rem] text-[var(--text-secondary)] leading-[1.5] whitespace-pre-wrap">
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Overview Script featuring: {data.hosts?.join(", ")}</p>
        </div>
        <div className="flex flex-col gap-3 bg-[var(--bg-canvas-subtle)] p-4 rounded-[var(--radius-lg)]">
          {transcript.map((line: any, i: number) => {
            const isHostA = line.speaker?.toLowerCase().includes("a") || i % 2 === 0;
            return (
              <div 
                key={i} 
                className={`flex items-start gap-[10px] ${isHostA ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.68rem] font-bold text-white shrink-0 ${isHostA ? 'bg-[var(--accent-orange)]' : 'bg-[var(--accent-blue)]'}`}>
                  {line.speaker?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-[14px] py-[10px] max-w-[75%] text-[0.8rem] leading-[1.4] text-[var(--text-secondary)]">
                  <strong className="block text-[0.7rem] text-[var(--text-primary)] mb-1">
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Scene Storyboard outline</p>
        </div>
        <div className="flex flex-col gap-4">
          {scenes.map((scene: any, i: number) => (
            <div key={i} className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] flex flex-col overflow-hidden">
              <div className="bg-[var(--bg-canvas-subtle)] border-b border-[var(--border-subtle)] px-4 py-2 text-[0.78rem] font-bold text-[var(--text-primary)]">
                Scene {scene.sceneNumber || (i + 1)}
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="border-r border-[var(--border-subtle)] pr-4">
                  <div className="text-[0.64rem] text-[var(--text-muted)] uppercase font-semibold mb-[6px]">Visual Storyboard</div>
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-[1.4]">{scene.visual}</p>
                </div>
                <div>
                  <div className="text-[0.64rem] text-[var(--text-muted)] uppercase font-semibold mb-[6px]">Audio/Voiceover</div>
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-[1.4]">{scene.audio}</p>
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Hierarchical Mind Map Outline</p>
        </div>
        <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center">
          {mainNode && (
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="bg-[var(--accent-orange)] text-white px-5 py-[10px] rounded-[var(--radius-md)] font-bold text-[0.9rem] shadow-[var(--shadow-sm)]">
                {mainNode.label}
              </div>
              <div className="flex justify-around flex-wrap gap-4 w-full">
                {getChildren(mainNode.id).map((subNode: any) => (
                  <div key={subNode.id} className="flex flex-col items-center gap-3 border border-dashed border-[var(--border-subtle)] p-3 rounded-[var(--radius-lg)] min-w-[160px] bg-[var(--bg-surface)]">
                    <div className="bg-[var(--bg-canvas-subtle)] border border-[var(--border-subtle)] px-3 py-[6px] rounded-[var(--radius-md)] text-[0.8rem] font-semibold text-[var(--text-primary)]">
                      {subNode.label}
                    </div>
                    <div className="flex flex-col gap-[6px] w-full">
                      {getChildren(subNode.id).map((childNode: any) => (
                        <div key={childNode.id} className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-2 py-1 rounded-[var(--radius-sm)] text-[0.72rem] text-[var(--text-secondary)] text-center">
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Infographic Layout & Visual Highlights</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {sections.map((sec: any, i: number) => (
            <div key={i} className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-[10px] shadow-[var(--shadow-sm)]">
              <div className="w-9 h-9 rounded-full bg-[rgba(249,115,22,0.1)] text-[var(--accent-orange)] flex items-center justify-center text-[0.8rem] font-bold">
                {i + 1}
              </div>
              <h4 className="text-[0.88rem] font-bold text-[var(--text-primary)]">{sec.title}</h4>
              <div className="bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-md)] border-l-[3px] border-l-[var(--accent-orange)] text-[0.84rem] font-bold text-[var(--text-secondary)]">
                {sec.dataPoint}
              </div>
              <p className="text-[0.75rem] text-[var(--text-muted)] italic mt-1">
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
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[var(--text-primary)]">{data.title}</h3>
          <p className="text-[0.78rem] text-[var(--text-muted)]">Structured Workspace Data</p>
        </div>
        <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-canvas)] shadow-[var(--shadow-sm)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-canvas-subtle)] border-b border-[var(--border-subtle)]">
                {headers.map((h: string, idx: number) => (
                  <th key={idx} className="px-4 py-3 text-left text-[0.75rem] font-bold text-[var(--text-primary)] uppercase tracking-[0.02em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], rowIdx: number) => (
                <tr key={rowIdx} className={rowIdx === rows.length - 1 ? "" : "border-b border-[var(--border-subtle)]"}>
                  {row.map((val: string, valIdx: number) => (
                    <td key={valIdx} className="px-4 py-3 text-[0.78rem] text-[var(--text-secondary)]">
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
          <div className="whitespace-pre-wrap leading-[1.6] text-[0.84rem]">
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
    <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
        <div className="text-[var(--accent-orange)]">
          {getFeatureIcon()}
        </div>
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">
          {data.title || doc.title}
        </span>
      </div>

      {/* Main Workspace Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-[760px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
