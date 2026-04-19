import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gavel,
  HelpCircle,
  ArrowRight,
  Loader2,
  Shield,
  FileText,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  PlusCircle,
   Scale,
  ListChecks,
  Info,
  Link as LinkIcon,
  Lightbulb,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { aiService } from "../services/aiService";

// ✅ ADDED: Government portal links mapped to categories
const GOVERNMENT_LINKS: Record<string, { label: string; url: string }[]> = {
  cyber: [
    { label: "National Cyber Crime Portal", url: "https://cybercrime.gov.in/" },
    { label: "CERT-In", url: "https://www.cert-in.org.in/" },
  ],
  fraud: [
    { label: "Consumer Helpline", url: "https://consumerhelpline.gov.in/" },
    { label: "National PG Portal", url: "https://pgportal.gov.in/" },
  ],
  domestic: [
    { label: "National Commission for Women", url: "https://ncw.nic.in/" },
    { label: "Women Helpline (181)", url: "https://services.india.gov.in/" },
  ],
  property: [
    { label: "India Gov Services", url: "https://services.india.gov.in/" },
    { label: "RTI Online", url: "https://rtionline.gov.in/" },
  ],
  harassment: [
    { label: "National Commission for Women", url: "https://ncw.nic.in/" },
    { label: "Cyber Crime (Online Harassment)", url: "https://cybercrime.gov.in/" },
  ],
  other: [
    { label: "National PG Portal", url: "https://pgportal.gov.in/" },
    { label: "India Gov Services", url: "https://services.india.gov.in/" },
  ],
};

// ✅ ADDED: Parsed section type for card-based rendering
interface ParsedSection {
  emoji: string;
  title: string;
  content: string;
}

// ✅ ADDED: Parse AI markdown into structured sections
function parseGuidanceSections(markdown: string): ParsedSection[] {
  const sectionRegex = /^##\s+([\p{Emoji_Presentation}\p{Extended_Pictographic}]\s+.+)$/mu;
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const match = line.match(/^##\s+([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]\uFE0F?\s+.+)$/u)
      || line.match(/^##\s+([^\n]+)$/);

    if (match) {
      if (current) sections.push(current);
      const heading = match[1].trim();
      // Extract leading emoji if present
      const emojiMatch = heading.match(/^([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}🧾⚖️🪜🔗📄💡💬]\uFE0F?\s*)/u);
      const emoji = emojiMatch ? emojiMatch[1].trim() : "📌";
      const title = heading.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}🧾⚖️🪜🔗📄💡💬]\uFE0F?\s*/u, "").trim();
      current = { emoji, title, content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }

  if (current) sections.push(current);
  return sections;
}

// ✅ ADDED: Card color map by section title keywords
function getSectionIcon(title: string) {
  const t = title.toLowerCase();

  // 🔥 Multiple keyword matching (important)
  if (t.includes("summary") || t.includes("overview")) return Info;

  if (t.includes("legal") || t.includes("law") || t.includes("rights")) return Scale;

  if (t.includes("step") || t.includes("process") || t.includes("how")) return ListChecks;

  if (t.includes("document") || t.includes("proof") || t.includes("evidence")) return FileText;

  if (t.includes("tip") || t.includes("warning") || t.includes("important") || t.includes("caution")) return AlertTriangle;

  if (t.includes("portal") || t.includes("government") || t.includes("link") || t.includes("website")) return LinkIcon;

  if (t.includes("advice") || t.includes("suggestion")) return Lightbulb;

  return FileText;
}
export const LegalGuidance = () => {
  const { t } = useTranslation();

  const [issueType, setIssueType] = useState("");
  const [issueTypeId, setIssueTypeId] = useState(""); // ✅ ADDED: track id separately
  const [description, setDescription] = useState("");
  const [otherDescription, setOtherDescription] = useState(""); // ✅ ADDED: "Other" custom input
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]); // ✅ ADDED
  const resultRef = useRef<HTMLDivElement>(null); // ✅ ADDED: smooth scroll to result

  const issueTypes = [
    { id: "cyber", name: "🛡️ Cyber Crime", icon: Shield },
{ id: "fraud", name: "💰 Fraud / Scam", icon: Gavel },
{ id: "domestic", name: "🏠 Domestic Violence", icon: HelpCircle },
{ id: "property", name: "📄 Property Dispute", icon: FileText },
{ id: "harassment", name: "⚠️ Harassment", icon: HelpCircle },
{ id: "other", name: "➕ Other", icon: PlusCircle },
    // ✅ ADDED: "Other" category
    
  ];

  // 🔁 UPDATED: Debounced description change to prevent typing lag
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    []
  );

  // ✅ ADDED: Handler for "Other" textarea
  const handleOtherDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setOtherDescription(e.target.value);
    },
    []
  );

  // ✅ ADDED: Category select handler
  const handleCategorySelect = (id: string, name: string) => {
    setIssueTypeId(id);
    setIssueType(name);
    setOtherDescription("");
  };

  // 🔁 UPDATED: Submit handler — uses otherDescription if "Other" selected
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalDescription = issueTypeId === "other"
      ? otherDescription
      : description;

    if (!issueType || !finalDescription.trim()) {
      alert("Please select an issue type and describe your problem.");
      return;
    }

    setLoading(true);
    setGuidance(null);
    setParsedSections([]);

    try {
      const response = await aiService.getLegalGuidance({
        issueType: issueTypeId === "other" ? `Other: ${otherDescription.slice(0, 60)}` : issueType,
        description: finalDescription,
      });

      if (response?.content) {
        setGuidance(response.content);
        // ✅ ADDED: Parse into sections for card rendering
        const sections = parseGuidanceSections(response.content);
        setParsedSections(sections.length > 0 ? sections : []);
        // ✅ ADDED: Smooth scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        throw new Error("Invalid AI response");
      }

    } catch (error) {
      console.error("AI Guidance Error:", error);
      alert("Failed to get legal guidance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Government links for current category
  const govLinks = GOVERNMENT_LINKS[issueTypeId] || GOVERNMENT_LINKS["other"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3 sm:mb-4">
          {t("guidance.title")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-2">
          {t("guidance.subtitle")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* Form */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Issue Type */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-4">
                {t("guidance.form.issueType")}
              </label>

              {/* 🔁 UPDATED: 3-col grid on mobile for better fit */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {issueTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleCategorySelect(type.id, type.name)}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all touch-manipulation ${
                      issueTypeId === type.id
                        ? "border-saffron bg-saffron/5 text-saffron"
                        : "border-gray-100 hover:border-gray-200 text-gray-500 active:border-gray-300"
                    }`}
                  >
           
                    <span className="text-xl mb-1">
  {type.name.split(" ")[0]}
</span>

<span className="text-[10px] sm:text-xs font-bold text-center leading-tight">
  {type.name.split(" ").slice(1).join(" ")}
</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ ADDED: "Other" custom textarea — shown when "Other" selected */}
            <AnimatePresence>
              {issueTypeId === "other" && (
                <motion.div
                  key="other-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Describe Your Issue
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue in detail... (e.g. My landlord is refusing to return my security deposit)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all resize-none text-sm sm:text-base"
                    value={otherDescription}
                    onChange={handleOtherDescriptionChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description — hidden for "Other" since they have their own box */}
            {issueTypeId !== "other" && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  {t("guidance.form.description")}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t("guidance.form.descriptionPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all resize-none text-sm sm:text-base"
                  value={description}
                  onChange={handleDescriptionChange}
                />
              </div>
            )}

            {/* ✅ ADDED: Predefined gov portal quick links */}
            {issueTypeId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                <span className="text-xs font-semibold text-gray-400 w-full mb-0.5">
                  Quick portals for this issue:
                </span>
                {govLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-saffron/8 border border-saffron/20 text-saffron font-medium hover:bg-saffron/15 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !issueTypeId}
              className="w-full bg-saffron text-white py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-orange-600 transition-all shadow-lg shadow-saffron/20 flex items-center justify-center disabled:opacity-70 touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5 flex-shrink-0" />
                  {t("guidance.form.getting")}
                </>
              ) : (
                <>
                  {t("guidance.form.submit")}
                  <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* ✅ ADDED: Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 mb-8"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Result */}
        <AnimatePresence>
          {guidance && !loading && (
            <motion.div
              key="result"
              ref={resultRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >

              {/* Result header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-india p-2 rounded-lg flex-shrink-0">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-navy">
                  {t("guidance.result.title")}
                </h3>
              </div>

              {/* ✅ ADDED: Card-based section rendering */}
              {parsedSections.length > 0 ? (
                <div className="space-y-3">
                  {parsedSections.map((section, idx) => (
                    
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.3 }}
                      className={`rounded-2xl border p-4 sm:p-6 ${getSectionIcon(section.title)}`}
                    >
                    <div className="flex items-center gap-2 mb-3">
  {(() => {
    const Icon = getSectionIcon(section.title);
    return (
      <div className="p-2 rounded-lg bg-saffron/10">
        <Icon className="h-5 w-5 text-saffron" />
      </div>
    );
  })()}
  <h4 className="font-bold text-navy text-sm sm:text-base">
    {section.title}
  </h4>
</div>
                      <div className="prose prose-sm max-w-none text-gray-700 markdown-body">
                        <ReactMarkdown
                          components={{
                            // ✅ ADDED: Render links with external icon
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-saffron underline underline-offset-2 hover:text-orange-600 transition-colors break-all"
                              >
                                {children}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            ),
                          }}
                        >
                          {section.content.trim()}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Fallback: raw markdown if parsing yields no sections
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 markdown-body">
                  <ReactMarkdown>{guidance}</ReactMarkdown>
                </div>
              )}

              {/* ✅ ADDED: Follow-up / disclaimer banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-4 bg-saffron/10 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle className="h-5 w-5 text-saffron mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-navy/80">
                  <strong>Note:</strong> This guidance is AI-generated. For serious legal matters, please consult a qualified advocate.
                </p>
              </motion.div>

              {/* ✅ ADDED: "Ask another question" nudge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-white border border-gray-100 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <MessageSquare className="h-5 w-5 text-green-india flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 flex-1">
                  Have more details or follow-up questions? Update your description above and submit again for refined guidance.
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex-shrink-0 text-saffron hover:text-orange-600 transition-colors"
                  aria-label="Scroll to top"
                >
                  <ChevronRight className="h-5 w-5 rotate-[-90deg]" />
                </button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};