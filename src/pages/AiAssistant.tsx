import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Scale,
  Send,
  Paperclip,
  Search,
  Plus,
  FileText,
  Image,
  Mic,
  Eye,
  ChevronDown,
  X,
  Sparkles,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  Globe,
  Gavel,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Case {
  id: string | number;
  title: string;
  status?: "Active" | "Pending" | "Closed";
  description?: string;
  type?: string;
  court?: string;
  date?: string;
}

interface Evidence {
  id?: string;
  name?: string;
  title?: string;
  type?: string;
  size?: number;
  url?: string;
}

interface Message {
  role: "ai" | "user";
  content: string;
  time: string;
  lang?: string;
}

interface AiAssistantProps {
  cases?: Case[];
  evidence?: Evidence[];
  selectedCase?: Case | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildCaseSummary = (c: Case | null) => {
  if (!c) return "No case selected";

  return `
Case Title: ${c.title}
Type: ${c.type || "Unknown"}
Court: ${c.court || "Unknown"}
Status: ${c.status || "Unknown"}

Description:
${c.description || "Not provided"}
`;
};
const formatEvidence = (evidenceList: Evidence[]) => {
  if (!evidenceList || evidenceList.length === 0) return "No evidence uploaded";
  return evidenceList
    .map(
      (e, i) =>
        `Evidence ${i + 1}: ${e.name || e.title || "Document"} ${
          e.type ? `(${e.type})` : ""
        }`
    )
    .join("\n");
};

const getFileIcon = (type?: string) => {
  if (!type) return <FileText size={14} />;
  if (type.toLowerCase().includes("image") || type.toLowerCase().includes("jpg") || type.toLowerCase().includes("png"))
    return <Image size={14} />;
  if (type.toLowerCase().includes("audio") || type.toLowerCase().includes("mp3"))
    return <Mic size={14} />;
  return <FileText size={14} />;
};

const getStatusStyle = (status?: string) => {
  switch (status) {
    case "Active":
      return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: <CheckCircle size={10} /> };
    case "Pending":
      return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: <Clock size={10} /> };
    case "Closed":
      return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", icon: <XCircle size={10} /> };
    default:
      return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", icon: <AlertCircle size={10} /> };
  }
};

const MOCK_CASES: Case[] = [
  { id: "1", title: "Property Dispute – Sharma vs. Municipal Corp", status: "Active", type: "Civil", court: "Delhi High Court" },
  { id: "2", title: "Consumer Forum – Defective Product Claim", status: "Pending", type: "Consumer", court: "DCDRC" },
  { id: "3", title: "Labour Dispute – Wrongful Termination", status: "Closed", type: "Labour", court: "Labour Court" },
];

const MOCK_EVIDENCE: Evidence[] = [
  { id: "e1", name: "Property_Deed_2019.pdf", type: "PDF", size: 2400 },
  { id: "e2", name: "Municipal_Notice.pdf", type: "PDF", size: 980 },
  { id: "e3", name: "Site_Photos.jpg", type: "Image", size: 3200 },
];

const SMART_SUGGESTIONS = [
  { label: "Draft Legal Notice", icon: <BookOpen size={13} /> },
  { label: "Generate FIR", icon: <AlertCircle size={13} /> },
  { label: "Summarize Evidence", icon: <Sparkles size={13} /> },
  { label: "Check IPC Sections", icon: <Scale size={13} /> },
];

// ─── Typing Loader ────────────────────────────────────────────────────────────

const TypingLoader = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
      <Gavel size={14} className="text-white" />
    </div>
    <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1.5 items-center h-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  const renderAiContent = (content: string) => {
    const sections = [
      { emoji: "🔍", label: "Case Analysis", icon: <Search size={13} />, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
      { emoji: "⚖️", label: "Legal Issues & Risks", icon: <AlertCircle size={13} />, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
      { emoji: "📊", label: "Chances / Probability", icon: <TrendingUp size={13} />, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
      { emoji: "🧠", label: "Suggested Strategy", icon: <Lightbulb size={13} />, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
      { emoji: "❓", label: "Questions for User", icon: <HelpCircle size={13} />, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
    ];

    let parsed = content;
    const hasStructure = sections.some((s) => content.includes(s.emoji));

    if (!hasStructure) {
      return (
        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      );
    }

    return (
      <div className="space-y-3">
        {sections.map((sec) => {
          const pattern = new RegExp(`${sec.emoji}\\s*${sec.label}:\\s*([\\s\\S]*?)(?=${sections.map(s => s.emoji).join("|")}|$)`, "i");
          const match = content.match(pattern);
          if (!match || !match[1]?.trim()) return null;
          return (
            <div key={sec.label} className={`rounded-xl border ${sec.border} ${sec.bg} p-3`}>
              <div className={`flex items-center gap-1.5 font-semibold text-xs mb-1.5 ${sec.color}`}>
                {sec.icon}
                <span>{sec.emoji} {sec.label}</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {match[1].trim()}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in slide-in-from-right-2 fade-in duration-300">
        <div className="max-w-[80%]">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-[10px] text-stone-400 text-right mt-1 mr-1">{message.time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-4 animate-in slide-in-from-left-2 fade-in duration-300">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0 mb-5">
        <Gavel size={14} className="text-white" />
      </div>
      <div className="max-w-[85%]">
        <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          {renderAiContent(message.content)}
        </div>
        <p className="text-[10px] text-stone-400 mt-1 ml-1">{message.time}</p>
      </div>
    </div>
  );
};

// ─── Chat Input ───────────────────────────────────────────────────────────────

const ChatInput = ({
  value,
  onChange,
  onSend,
  loading,
  onSuggestion,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  onSuggestion: (s: string) => void;
}) => {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-stone-100 bg-white/80 backdrop-blur-sm p-3 space-y-2">
      {/* Smart suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {SMART_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestion(s.label)}
            className="flex items-center gap-1.5 text-xs bg-stone-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-transparent text-stone-600 rounded-full px-3 py-1.5 whitespace-nowrap transition-all duration-200 flex-shrink-0"
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Apna case describe karein ya koi question poochhein..."
            className="w-full resize-none border border-stone-200 rounded-2xl px-4 py-3 pr-10 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-stone-50 max-h-[120px] leading-relaxed"
            style={{ overflow: "hidden" }}
          />
          <button className="absolute right-3 bottom-3 text-stone-400 hover:text-amber-500 transition-colors">
            <Paperclip size={16} />
          </button>
        </div>
        <button
          onClick={onSend}
          disabled={loading || !value.trim()}
          className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md hover:shadow-amber-200 hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Evidence Panel ───────────────────────────────────────────────────────────

const EvidencePanel = ({ evidence }: { evidence: Evidence[] }) => {
  const [collapsed, setCollapsed] = useState(false);
  const list = evidence && evidence.length > 0 ? evidence : MOCK_EVIDENCE;

  return (
    <div className="border-t border-stone-100 bg-stone-50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-widest hover:bg-stone-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Paperclip size={12} />
          Evidence ({list.length})
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-1.5">
          {list.map((e, i) => (
            <div
              key={e.id || i}
              className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-stone-200 group hover:border-amber-300 transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(e.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-700 truncate max-w-[140px]">
                    {e.name || e.title || "Document"}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {e.type || "File"}{e.size ? ` · ${(e.size / 1024).toFixed(0)} KB` : ""}
                  </p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-amber-600">
                <Eye size={13} />
              </button>
            </div>
          ))}

          <button className="w-full mt-1 flex items-center justify-center gap-2 text-xs text-amber-600 hover:text-amber-700 border border-dashed border-amber-300 rounded-xl py-2.5 hover:bg-amber-50 transition-all">
            <Upload size={12} />
            Upload Evidence
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Case Selector ────────────────────────────────────────────────────────────

const CaseSelector = ({
  cases,
  activeCase,
  onSelect,
  onNewCase,
}: {
  cases: Case[];
  activeCase: Case | null;
  onSelect: (c: Case) => void;
  onNewCase: () => void;
}) => {
  const [search, setSearch] = useState("");
  const filtered = cases.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
              <Scale size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-800 leading-tight">PocketLawyer</h2>
              <p className="text-[10px] text-stone-400">AI Legal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-stone-400">Live</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full text-xs bg-stone-100 border-0 rounded-xl pl-8 pr-3 py-2.5 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Cases List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">
          My Cases ({filtered.length})
        </p>
        {filtered.map((c) => {
          const s = getStatusStyle(c.status);
          const isActive = activeCase?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all duration-200 ${
                isActive
                  ? "bg-amber-50 border-amber-300 shadow-sm"
                  : "bg-white border-stone-200 hover:border-amber-200 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    isActive ? "text-amber-800" : "text-stone-700"
                  }`}
                >
                  {c.title}
                </p>
                {c.status && (
                  <span
                    className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                    {c.status}
                  </span>
                )}
              </div>
              {(c.type || c.court) && (
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {c.type}{c.court ? ` · ${c.court}` : ""}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* New Case Button */}
      <div className="px-3 py-3 border-t border-stone-100">
        <button
          onClick={onNewCase}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold rounded-xl py-2.5 shadow-md hover:shadow-amber-200 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={14} />
          New Case
        </button>
      </div>
    </div>
  );
};

// ─── Chat Window ──────────────────────────────────────────────────────────────

const ChatWindow = ({
  messages,
  loading,
  activeCase,
}: {
  messages: Message[];
  loading: boolean;
  activeCase: Case | null;
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!activeCase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-white px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center mb-5 shadow-inner">
          <Scale size={36} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-2">Vakilsaab Ready Hai</h3>
        <p className="text-sm text-stone-500 max-w-xs leading-relaxed">
          Select a case from the sidebar to begin your AI-powered legal consultation. Your personal advocate awaits.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-xs">
          {SMART_SUGGESTIONS.map((s) => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-stone-500">
              <span className="text-amber-500">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}
      {loading && <TypingLoader />}
      <div ref={bottomRef} />
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const AiAssistant: React.FC<Props> = ({
  cases: propCases,
  evidence: propEvidence,
  selectedCase: propSelected,
}) => {
  const cases = propCases && propCases.length > 0 ? propCases : MOCK_CASES;
  const [activeCase, setActiveCase] = useState<Case | null>(propSelected || null);
  const allEvidence = propEvidence || MOCK_EVIDENCE;

const evidence = activeCase
  ? allEvidence.filter((e: any) => e.caseId === activeCase.id)
  : [];

  
  const [caseChats, setCaseChats] = useState<Record<string, Message[]>>(() => {
  try {
    const saved = localStorage.getItem("pl_case_chats");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "👋 Namaste! Main aapka AI Legal Assistant hoon. Koi case select karein aur apna sawal poochhein.", time: "Now" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<"auto" | "en" | "hi">("auto");

  // Load chats from localStorage


  useEffect(() => {
    try {
      localStorage.setItem("pl_case_chats", JSON.stringify(caseChats));
    } catch {}
  }, [caseChats]);

  const selectCase = useCallback(
    (c: Case) => {
      setActiveCase(c);
      setSidebarOpen(false);
      const existing = caseChats[String(c.id)];
      if (existing && existing.length > 0) {
        setMessages(existing);
      } else {
        setMessages([
          {
            role: "ai",
            content: `⚖️ Namaste! Maine aapka case **"${c.title}"** open kar diya hai. Mujhe batayein — aap kaunsa legal issue discuss karna chahte hain?`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    },
    [caseChats]
  );

  const pushMessages = useCallback(
    (updated: Message[]) => {
      setMessages(updated);
      if (activeCase) {
        setCaseChats((prev) => ({ ...prev, [String(activeCase.id)]: updated }));
      }
    },
    [activeCase]
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      if (!content) return;

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMsg: Message = { role: "user", content, time: now };
      const withUser = [...messages, userMsg];
      const isFirstMessage = messages.filter(m => m.role === "user").length === 1;
      pushMessages(withUser);
      setInput("");
      setLoading(true);
const systemPrompt = isFirstMessage
  ? `You are a senior Indian lawyer.

FIRST RESPONSE MODE:

You MUST respond in this structured format:

🔍 Case Analysis:
⚖️ Legal Issues & Risks:
📊 Chances / Probability:
🧠 Suggested Strategy:
❓ Questions for User:

Be detailed and professional.`
  
  : `You are a senior Indian lawyer.

FOLLOW-UP MODE:


- Talk like a smart lawyer (natural conversation)
- Do NOT repeat structured format
- Answer directly
- Be practical and actionable
- Keep responses short-medium length
- NEVER repeat full case analysis again
- Only respond to latest user intent
- If user gives new facts, re-evaluate strategy
- Continue conversation naturally

Behave like ChatGPT + Lawyer combo.`;

      try {
        const apiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pocketlawyer.in",
            "X-Title": "PocketLawyer",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
messages: [
  { role: "system", content: systemPrompt },

  ...withUser.map((m) => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.content,
  })),

  {
  role: "user",
  content: `CASE DETAILS:
${buildCaseSummary(activeCase)}

EVIDENCE:
${formatEvidence(evidence)}

INSTRUCTIONS:
- Understand full conversation deeply
- Do NOT repeat previous answers
- Build on previous replies
- Think like a senior lawyer

EVIDENCE ANALYSIS:
- Identify contradictions
- Check authenticity risks
- Identify missing documents
- Suggest what evidence is needed

LATEST USER MESSAGE:
${content}
`,
},
]
          }),
        });

        const data = await res.json();
        const replyText =
          data.choices?.[0]?.message?.content ||
          "⚠️ AI se response nahi aaya. Thodi der baad try karein.";

        const aiMsg: Message = {
          role: "ai",
          content: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        pushMessages([...withUser, aiMsg]);
      } catch {
        const errMsg: Message = {
          role: "ai",
          content: "⚠️ Network error aaya. Please apna internet check karein aur dobara try karein.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        pushMessages([...withUser, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, activeCase, evidence, lang, pushMessages]
  );

  const handleSuggestion = (label: string) => {
    const prompts: Record<string, string> = {
      "Draft Legal Notice": "Please draft a formal legal notice for this case.",
      "Generate FIR": "Help me draft an FIR for this matter with all necessary details.",
      "Summarize Evidence": "Please analyze and summarize all the evidence uploaded for this case.",
      "Check IPC Sections": "Which IPC sections apply to my case? Please explain each.",
    };
    sendMessage(prompts[label] || label);
  };

  const caseStatus = activeCase ? getStatusStyle(activeCase.status) : null;

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col bg-white border-r border-stone-200 shadow-sm flex-shrink-0">
        <div className="flex-1 overflow-hidden flex flex-col">
          <CaseSelector
            cases={cases}
            activeCase={activeCase}
            onSelect={selectCase}
            onNewCase={() => {}}
          />
        </div>
        <EvidencePanel evidence={evidence} />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white flex flex-col shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
            >
              <X size={16} />
            </button>
            <div className="flex-1 overflow-hidden flex flex-col">
              <CaseSelector
                cases={cases}
                activeCase={activeCase}
                onSelect={selectCase}
                onNewCase={() => {}}
              />
            </div>
            <EvidencePanel evidence={evidence} />
          </div>
        </div>
      )}

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white/90 backdrop-blur-sm shadow-sm flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <Scale size={18} />
          </button>

          {activeCase ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-stone-800 truncate">{activeCase.title}</h1>
                {activeCase.status && caseStatus && (
                  <span className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${caseStatus.bg} ${caseStatus.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${caseStatus.dot}`} />
                    {activeCase.status}
                  </span>
                )}
              </div>
              {activeCase.court && (
                <p className="text-[10px] text-stone-400">{activeCase.court}</p>
              )}
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="text-sm font-bold text-stone-800">AI Legal Assistant</h1>
              <p className="text-[10px] text-stone-400">Select a case to begin</p>
            </div>
          )}

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            {(["auto", "en", "hi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  lang === l
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {l === "auto" ? <Globe size={11} /> : l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Chat Messages */}
        <ChatWindow messages={messages} loading={loading} activeCase={activeCase} />

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
          loading={loading}
          onSuggestion={handleSuggestion}
        />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body, .font-sans { font-family: 'DM Sans', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-in-from-right { from { transform: translateX(8px); opacity: 0; } }
        @keyframes slide-in-from-left { from { transform: translateX(-8px); opacity: 0; } }
        .animate-in { animation: slide-in-from-right 0.3s ease; }
      `}</style>
    </div>
  );
};

export default AiAssistant;