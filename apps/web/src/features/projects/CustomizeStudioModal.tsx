import React, { useState } from "react";
import { X, Play, HelpCircle, Sparkles, Check, ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useGenerateStudio } from "../../lib/hooks";
import { toast } from "sonner";

export function CustomizeStudioModal({
  isOpen,
  feature,
  onClose,
  projectId
}: {
  isOpen: boolean;
  feature: string | null;
  onClose: () => void;
  projectId: string;
}) {
  const { setSelectedDocumentId, setCenterPanelMode, selectedModelId } = useWorkspaceStore();
  
  const generateStudioMutation = useGenerateStudio(projectId);

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
        customParams,
        selectedModelId
      });
      setSelectedDocumentId(doc.id);
      if (doc.studioFeature) {
        setCenterPanelMode("studio");
      }
      onClose();
    } catch (err) {
      toast.error("Failed to generate studio content: " + (err as Error).message);
    }
  };

  const renderQuizCustomizer = () => {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex gap-8 flex-wrap">
          {/* Number of Questions */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">Number of Questions</span>
            <div className="flex gap-2">
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
                    className={`flex items-center gap-1 px-[14px] py-[6px] text-[0.76rem] font-medium rounded-full border cursor-pointer ${isSelected ? 'border-[#4F46E5] bg-[rgba(79,70,229,0.15)] text-[#A5B4FC]' : 'border-[#3F3F46] bg-transparent text-[#D4D4D8]'}`}
                  >
                    {isSelected && <Check size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level of Difficulty */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">Level of Difficulty</span>
            <div className="flex gap-2">
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
                    className={`flex items-center gap-1 px-[14px] py-[6px] text-[0.76rem] font-medium rounded-full border cursor-pointer ${isSelected ? 'border-[#4F46E5] bg-[rgba(79,70,229,0.15)] text-[#A5B4FC]' : 'border-[#3F3F46] bg-transparent text-[#D4D4D8]'}`}
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
        <div className="flex flex-col gap-2">
          <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">What should the topic be?</span>
          <div className="relative bg-[#09090B] border border-[#27272A] rounded-[var(--radius-lg)] p-4 min-h-[150px] flex flex-col">
            <textarea
              placeholder="e.g., Focus solely on key concepts of physics, or prepare for history exam on Ancient Egypt..."
              value={quizTopic}
              onChange={e => setQuizTopic(e.target.value)}
              className="flex-1 w-full h-full bg-transparent border-none outline-none text-[#F4F4F5] resize-none text-[0.82rem] font-[family-name:var(--font-sans)] leading-[1.5]"
            />
            {quizTopic.length === 0 && (
              <div className="text-[0.75rem] text-[#71717A] mt-3 border-t border-[#18181B] pt-2">
                <span className="font-semibold block mb-1">Things to try</span>
                <ul className="pl-[14px] flex flex-col gap-[2px] list-disc">
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
      <div className="flex flex-col gap-5">
        {/* Format selection */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">Format</span>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
            {formats.map(f => {
              const isSelected = audioFormat === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setAudioFormat(f.id as any)}
                  className={`flex flex-col gap-1 p-[12px_14px] rounded-[var(--radius-lg)] border cursor-pointer transition-all relative ${isSelected ? 'bg-[rgba(79,70,229,0.08)] border-[#4F46E5]' : 'bg-[#09090B] border-[#27272A]'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[0.8rem] font-bold ${isSelected ? 'text-[#A5B4FC]' : 'text-[#F4F4F5]'}`}>{f.title}</span>
                    {isSelected && <Check size={12} className="text-[#A5B4FC]" />}
                  </div>
                  <span className="text-[0.68rem] text-[#9A9A8B] leading-[1.3]">{f.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-8 flex-wrap">
          {/* Choose Language */}
          <div className="flex flex-col gap-2 w-[160px]">
            <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">Choose language</span>
            <div className="relative">
              <select
                value={audioLanguage}
                onChange={e => setAudioLanguage(e.target.value)}
                className="w-full px-3 py-[6px] bg-[#09090B] border border-[#27272A] rounded-[var(--radius-md)] text-[#F4F4F5] text-[0.76rem] outline-none cursor-pointer appearance-none"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]" />
            </div>
          </div>

          {/* Length */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">Length</span>
            <div className="flex gap-2">
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
                    className={`flex items-center gap-1 px-[14px] py-[6px] text-[0.76rem] font-medium rounded-full border cursor-pointer ${isSelected ? 'border-[#4F46E5] bg-[rgba(79,70,229,0.15)] text-[#A5B4FC]' : 'border-[#3F3F46] bg-transparent text-[#D4D4D8]'}`}
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
        <div className="flex flex-col gap-2">
          <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">What should the AI hosts focus on in this episode?</span>
          <div className="relative bg-[#09090B] border border-[#27272A] rounded-[var(--radius-lg)] p-4 min-h-[130px] flex flex-col">
            <textarea
              placeholder="e.g. Focus on a specific source, target a specific audience, or discuss main characters..."
              value={audioFocus}
              onChange={e => setAutoFocus(e.target.value)}
              className="flex-1 w-full h-full bg-transparent border-none outline-none text-[#F4F4F5] resize-none text-[0.82rem] font-[family-name:var(--font-sans)] leading-[1.5]"
            />
            {audioFocus.length === 0 && (
              <div className="text-[0.75rem] text-[#71717A] mt-3 border-t border-[#18181B] pt-2">
                <span className="font-semibold block mb-1">Things to try</span>
                <ul className="pl-[14px] flex flex-col gap-[2px] list-disc">
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
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[0.78rem] font-semibold text-[#E4E4E7]">What should the focus of the {titleLabel} be?</span>
          <textarea
            placeholder={`e.g., Focus specifically on main themes, key dates, or specific target details...`}
            value={genericTopic}
            onChange={e => setGenericTopic(e.target.value)}
            className="w-full h-[150px] bg-[#09090B] border border-[#27272A] rounded-[var(--radius-lg)] p-4 text-[#F4F4F5] outline-none resize-none text-[0.82rem] font-[family-name:var(--font-sans)] leading-[1.5]"
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
    <div className="fixed inset-0 z-[1000] bg-[rgba(9,9,11,0.8)] backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-[#18181B] border border-[#27272A] rounded-[var(--radius-xl)] w-full max-w-[680px] flex flex-col shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2 text-[#F4F4F5]">
            <Sparkles size={16} className="text-[#A5B4FC]" />
            <span className="text-[0.95rem] font-bold">{getFeatureTitle()}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1 rounded-full bg-transparent border-none cursor-pointer text-[#71717A] transition-all hover:bg-[#27272A] hover:text-[#F4F4F5]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(80vh-120px)]">
          {feature === "quiz" && renderQuizCustomizer()}
          {feature === "audio-overview" && renderAudioCustomizer()}
          {feature !== "quiz" && feature !== "audio-overview" && renderGenericCustomizer()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-[10px] px-6 py-4 border-t border-[#27272A] bg-[#111115]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[0.78rem] font-semibold bg-transparent border border-[#3F3F46] rounded-full text-[#D4D4D8] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generateStudioMutation.isPending}
            className="flex items-center gap-[6px] px-5 py-2 text-[0.78rem] font-semibold bg-[#4F46E5] border-none rounded-full text-white cursor-pointer disabled:opacity-70"
          >
            {generateStudioMutation.isPending ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
