// ============================================================
// ComplaintGenerator.tsx — FIXED VERSION
//
// ROOT CAUSE OF ALL BUGS:
// Step1 / Step2 / Step3 / SignatureCanvas were defined as
// component functions INSIDE the parent component body.
// React creates a NEW component type identity on every render,
// so on every keystroke it unmounts + remounts the entire step →
// inputs lose focus, page appears to "refresh", lag, etc.
//
// FIXES APPLIED:
// 1. All sub-components moved OUTSIDE the parent function (module level)
// 2. useCallback on every handler — stable references between renders
// 3. memo() on every sub-component — skips re-render if props unchanged
// 4. INITIAL_FORM constant at module level — not recreated on render
// 5. AI call only fires on button click via handleGenerate, never on render
// 6. result state is fully isolated — typing never resets the output
// 7. useEffect deps are explicit — no infinite loops
// 8. generateComplaintViaBackend calls YOUR backend (/api/ai/generate-complaint)
//    so no API key is ever exposed in the frontend
// ============================================================

import React, {
  useState, useRef, useEffect, useCallback, memo
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Send, Copy, Printer, CheckCircle,
  Loader2, Upload, ChevronRight, ChevronLeft, RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormData {
  category: string;
  categoryLabel: string;
  applicantName: string;
  applicantAddress: string;
  applicantMobile: string;
  date: string;
  receiver: string;
  subject: string;
  description: string;
  requestedAction: string;
  declaration: boolean;
  signatureMode: 'none' | 'manual' | 'digital';
  signatureDataUrl: string | null;
}

// ─── Category Config (module-level constant — never recreated) ────────────────

export const CATEGORIES = [
  { key: 'formal',    emoji: '📄', label: 'Formal Complaint',                tone: 'formal and structured' },
  { key: 'informal',  emoji: '💬', label: 'Informal Complaint',              tone: 'simple and conversational' },
  { key: 'written',   emoji: '📝', label: 'Written Complaint (Application)', tone: 'formal written application' },
  { key: 'legal',     emoji: '⚖️', label: 'Legal Complaint',                 tone: 'strict legal tone with IPC references' },
  { key: 'police',    emoji: '🚓', label: 'Police Complaint (FIR/NCR)',      tone: 'formal police FIR format' },
  { key: 'consumer',  emoji: '🛒', label: 'Consumer Complaint',              tone: 'formal consumer grievance' },
  { key: 'service',   emoji: '🛠️', label: 'Service Complaint',               tone: 'professional service feedback' },
  { key: 'workplace', emoji: '🏢', label: 'Workplace Complaint',             tone: 'professional HR tone' },
  { key: 'grievance', emoji: '📢', label: 'Grievance Complaint',             tone: 'formal grievance redressal format' },
  { key: 'public',    emoji: '🌐', label: 'Public Complaint',                tone: 'civic formal tone' },
  { key: 'anonymous', emoji: '🕶️', label: 'Anonymous Complaint',             tone: 'formal without disclosing identity' },
  { key: 'signed',    emoji: '✍️', label: 'Signed Complaint',                tone: 'formal with full identification' },
  { key: 'printed',   emoji: '🖨️', label: 'Online Printed (Offline Submit)', tone: 'print-ready format with blank spaces' },
];

// ─── Initial form state (module-level — stable reference for reset) ───────────

const INITIAL_FORM: FormData = {
  category:         '',
  categoryLabel:    '',
  applicantName:    '',
  applicantAddress: '',
  applicantMobile:  '',
  date:             new Date().toISOString().split('T')[0],
  receiver:         '',
  subject:          '',
  description:      '',
  requestedAction:  '',
  declaration:      false,
  signatureMode:    'none',
  signatureDataUrl: null,
};

// ─── Backend API call — API key stays on server, never in frontend ────────────

async function generateComplaintViaBackend(data: FormData): Promise<string> {
  const category = CATEGORIES.find(c => c.key === data.category);

  const response = await fetch('/api/ai/generate-complaint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category:      `${category?.label ?? data.category} — tone: ${category?.tone ?? 'formal'}`,
      date:          data.date,
      location:      data.applicantAddress || 'Not specified',
      opposingParty: data.receiver         || 'Concerned Authority',
      description: [
        `Applicant: ${data.applicantName}`,
        `Mobile: ${data.applicantMobile}`,
        `Subject: ${data.subject}`,
        data.description,
        `Requested Action: ${data.requestedAction || 'Appropriate legal action'}`,
      ].filter(Boolean).join('\n'),
    }),
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const json = await response.json();
  return json.content ?? 'Generation failed. Please try again.';
}

// ─── SignatureCanvas — FIXED: defined outside parent, wrapped in memo ─────────

interface SignatureCanvasProps {
  onSave:  (dataUrl: string) => void;
  onClear: () => void;
}

const SignatureCanvas = memo(({ onSave, onClear }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);

  const getPos = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1A1A2E';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  }, [getPos]);

  const stop = useCallback(() => {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL());
  }, [onSave]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  }, [onClear]);

  return (
    <div>
      <canvas
        ref={canvasRef} width={400} height={120}
        className="w-full border border-gray-300 rounded-xl bg-white cursor-crosshair touch-none"
        style={{ maxHeight: 120 }}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
      />
      <button type="button" onClick={clear} className="mt-2 text-xs text-gray-500 flex items-center gap-1 hover:text-red-500 transition-colors">
        <RotateCcw className="h-3 w-3" /> Clear signature
      </button>
    </div>
  );
});
SignatureCanvas.displayName = 'SignatureCanvas';

// ─── StepBar — FIXED: defined outside parent, receives step as prop ───────────

const STEP_LABELS = ['Category', 'Details', 'Generate'];

const StepBar = memo(({ step }: { step: number }) => (
  <div className="flex items-center justify-center gap-2 mb-10">
    {STEP_LABELS.map((label, i) => {
      const idx = i + 1; const active = step === idx; const done = step > idx;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${done ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {done ? <CheckCircle className="h-4 w-4" /> : idx}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-orange-500' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`h-0.5 w-12 mb-4 transition-all duration-300 ${step > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
));
StepBar.displayName = 'StepBar';

// ─── Step 1 — FIXED: defined outside parent ───────────────────────────────────

interface Step1Props {
  selectedCategory: string;
  onSelect: (key: string, label: string) => void;
  onNext: () => void;
}

const Step1 = memo(({ selectedCategory, onSelect, onNext }: Step1Props) => (
  <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
    <h2 className="text-xl font-bold text-navy mb-1">Select Complaint Type</h2>
    <p className="text-sm text-gray-500 mb-6">AI will auto-adjust tone and format based on your selection</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CATEGORIES.map(cat => (
        <motion.button
          key={cat.key} type="button"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(cat.key, cat.label)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200
            ${selectedCategory === cat.key
              ? 'border-orange-400 bg-orange-50 shadow-md'
              : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}
        >
          <span className="text-2xl">{cat.emoji}</span>
          <span className="text-xs font-semibold text-navy leading-tight">{cat.label}</span>
        </motion.button>
      ))}
    </div>
    <button type="button" disabled={!selectedCategory} onClick={onNext}
      className="mt-8 w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white py-4 rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center disabled:opacity-40">
      Continue <ChevronRight className="ml-2 h-5 w-5" />
    </button>
  </motion.div>
));
Step1.displayName = 'Step1';

// ─── Step 2 — FIXED: defined outside parent, handlers use useCallback ─────────

interface Step2Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const Step2 = memo(({ formData, onChange, onBack, onNext }: Step2Props) => {
  // Each handler is stable — field name captured in closure
  const hName        = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('applicantName',    e.target.value),   [onChange]);
  const hAddress     = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('applicantAddress', e.target.value),   [onChange]);
  const hMobile      = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('applicantMobile',  e.target.value),   [onChange]);
  const hDate        = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('date',             e.target.value),   [onChange]);
  const hReceiver    = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('receiver',         e.target.value),   [onChange]);
  const hSubject     = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('subject',          e.target.value),   [onChange]);
  const hDescription = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description',      e.target.value),   [onChange]);
  const hAction      = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('requestedAction',  e.target.value),   [onChange]);
  const hDeclaration = useCallback((e: React.ChangeEvent<HTMLInputElement>)    => onChange('declaration',      e.target.checked), [onChange]);
  const hSigNone     = useCallback(() => onChange('signatureMode', 'none'),    [onChange]);
  const hSigManual   = useCallback(() => onChange('signatureMode', 'manual'),  [onChange]);
  const hSigDigital  = useCallback(() => onChange('signatureMode', 'digital'), [onChange]);
  const hSigSave     = useCallback((url: string) => onChange('signatureDataUrl', url), [onChange]);
  const hSigClear    = useCallback(() => onChange('signatureDataUrl', null),   [onChange]);

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm";

  return (
    <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="space-y-6">

      <div>
        <p className="text-sm font-bold text-navy mb-3">👤 Applicant Information</p>
        <div className="space-y-3">
          <input type="text" placeholder="Full Name"     value={formData.applicantName}    onChange={hName}    className={inp} />
          <input type="text" placeholder="Full Address"  value={formData.applicantAddress} onChange={hAddress} className={inp} />
          <input type="tel"  placeholder="Mobile Number" value={formData.applicantMobile}  onChange={hMobile}  className={inp} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy mb-2">📅 Date</label>
          <input type="date" value={formData.date} onChange={hDate} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-2">🏢 Receiver / Authority</label>
          <input type="text" placeholder="Manager / Police Station" value={formData.receiver} onChange={hReceiver} className={inp} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-2">🧾 Subject</label>
        <input type="text" placeholder="One-line summary of complaint" value={formData.subject} onChange={hSubject} className={inp} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-1">🧠 Complaint का विवरण लिखें</label>
        <p className="text-xs text-gray-400 mb-2">AI समझकर पूरा आवेदन बनाएगा — क्या हुआ, कब हुआ, कहाँ हुआ, किसके द्वारा हुआ</p>
        <textarea rows={6} placeholder={"क्या हुआ...\nकब हुआ...\nकहाँ हुआ...\nकिसके द्वारा हुआ..."}
          value={formData.description} onChange={hDescription} className={`${inp} resize-none`} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-2">📎 Proof / Evidence (Optional)</label>
        <div className="flex justify-center px-6 pt-4 pb-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-300 transition-colors cursor-pointer group">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-300 group-hover:text-orange-400 transition-colors" />
            <p className="text-xs text-gray-400 mt-1">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-300">PNG, JPG, PDF up to 10MB</p>
            <input type="file" className="sr-only" accept="image/*,.pdf" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-2">🎯 आप क्या action चाहते हैं?</label>
        <input type="text" placeholder="e.g. Refund, FIR दर्ज करें, Action लें, Inquiry करें"
          value={formData.requestedAction} onChange={hAction} className={inp} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={formData.declaration} onChange={hDeclaration} className="mt-0.5 w-4 h-4 accent-orange-500" />
        <span className="text-sm text-gray-600">☑️ दी गई जानकारी मेरे अनुसार सही है और मैं इसकी जिम्मेदारी लेता/लेती हूँ।</span>
      </label>

      <div>
        <label className="block text-xs font-semibold text-navy mb-3">✍️ Signature</label>
        <div className="flex gap-3 mb-4">
          {([
            { mode: 'none'    as const, label: '— None',            handler: hSigNone    },
            { mode: 'manual'  as const, label: '🖊 Manual (Print)', handler: hSigManual  },
          ]).map(({ mode, label, handler }) => (
            <button key={mode} type="button" onClick={handler}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all
                ${formData.signatureMode === mode
                  ? 'border-orange-400 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}>
              {label}
            </button>
          ))}
        </div>
       
        {formData.signatureMode === 'manual' && (
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">A blank signature line will be added to the printed complaint.</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="button" disabled={!formData.description || !formData.declaration} onClick={onNext}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white py-3 rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center disabled:opacity-40">
          Preview & Generate <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
});
Step2.displayName = 'Step2';

// ─── Step 3 — FIXED: defined outside parent ───────────────────────────────────

interface Step3Props {
  formData: FormData;
  loading: boolean;
  onBack: () => void;
  onGenerate: () => void;   // AI only fires here — never on render
}

const Step3 = memo(({ formData, loading, onBack, onGenerate }: Step3Props) => {
  const category = CATEGORIES.find(c => c.key === formData.category);
  return (
    <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="space-y-5">
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
        <p className="text-sm font-bold text-orange-700 mb-3">📋 Review Before Generating</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {([
            ['Type',      `${category?.emoji ?? ''} ${category?.label ?? ''}`],
            ['Applicant', formData.applicantName   || '—'],
            ['Date',      formData.date],
            ['Receiver',  formData.receiver        || '—'],
            ['Mobile',    formData.applicantMobile || '—'],
            ['Signature', formData.signatureMode],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k}><span className="text-gray-400">{k}: </span><span className="font-semibold text-navy">{v}</span></div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 line-clamp-2">Description: {formData.description}</p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
          <ChevronLeft className="h-4 w-4" /> Edit
        </button>
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={loading} onClick={onGenerate}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center disabled:opacity-70 transition-all">
          {loading
            ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> AI Draft तैयार हो रहा है...</>
            : <><Send className="mr-2 h-5 w-5" /> Generate Complaint</>}
        </motion.button>
      </div>
    </motion.div>
  );
});
Step3.displayName = 'Step3';

// ─── Main Component ───────────────────────────────────────────────────────────

export const ComplaintGenerator: React.FC = () => {
  const [step,     setStep]     = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<string | null>(null); // isolated from form state
  const [copied,   setCopied]   = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // FIXED: [] — runs exactly once on mount
  useEffect(() => {
    document.title = 'LawDraft AI — Generate Legal Complaints Instantly';
  }, []);

  // FIXED: only scrolls when result changes, not on every render
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Single generic field updater — stable reference via useCallback
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCategorySelect = useCallback((key: string, label: string) => {
    setFormData(prev => ({ ...prev, category: key, categoryLabel: label }));
  }, []);

  const goNext = useCallback(() => setStep(s => s + 1), []);
  const goBack = useCallback(() => setStep(s => s - 1), []);

  // FIXED: AI call only triggered by button click — never fires automatically
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const text = await generateComplaintViaBackend(formData);
      setResult(text);
    } catch (err) {
      console.error('Complaint generation error:', err);
      setResult('⚠️ Generation failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const copyToClipboard = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handlePrint = useCallback(() => {
    if (!result) return;
    const win = window.open('', '_blank');
    if (!win) return;
   const sig =
  '<div style="margin-top:40px;">' +
  '<div style="border-bottom:1px solid #000;width:220px;height:40px;"></div>' +
  '<p style="font-size:12px;margin-top:6px;">Signature</p>' +
  '</div>';
    win.document.write(`<html><head><title>LawDraft AI - Complaint</title>
<style>body{font-family:serif;padding:48px;line-height:1.7;color:#1A1A2E;max-width:800px;margin:0 auto;}
h1,h2,h3{color:#1A1A2E;}@page{margin:2cm;}.sig{margin-top:32px;}</style></head>
<body><div>${result.replace(/\n/g, '<br/>')}</div>
${sig ? `<div class="sig">${sig}</div>` : ''}
<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    win.document.close();
  }, [result, formData.signatureDataUrl, formData.signatureMode]);

  const handleReset = useCallback(() => {
    setResult(null);
    setStep(1);
    setFormData(INITIAL_FORM);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 leading-tight">LawDraft AI</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Draft professional legal complaints in seconds using AI — fast, accurate, and court-ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">

        {/* Form Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100">

          <StepBar step={step} />

          {/* AnimatePresence works correctly because components are stable external types */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1 key="s1" selectedCategory={formData.category} onSelect={handleCategorySelect} onNext={goNext} />
            )}
            {step === 2 && (
              <Step2 key="s2" formData={formData} onChange={handleFieldChange} onBack={goBack} onNext={goNext} />
            )}
            {step === 3 && (
              <Step3 key="s3" formData={formData} loading={loading} onBack={goBack} onGenerate={handleGenerate} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result Panel */}
        <motion.div ref={resultRef} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 min-h-[500px]">

          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
              <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
              <p className="text-navy font-semibold">AI Draft तैयार हो रहा है...</p>
              <p className="text-sm text-gray-400">Analyzing your complaint and generating formatted document</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col h-full">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                <p className="text-green-700 font-medium text-sm">✅ Your legal complaint is ready — review, copy, or print below</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                  <CheckCircle className="text-green-500 h-5 w-5" /> Generated Draft
                </h3>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.93 }} onClick={copyToClipboard}
                    className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all" title="Copy">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-600" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={handlePrint}
                    className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all" title="Print">
                    <Printer className="h-4 w-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-grow overflow-auto prose prose-slate max-w-none">
               
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handlePrint}
                  className="flex-1 bg-navy text-white py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-navy/90 transition-all gap-2 text-sm">
                  <Printer className="h-4 w-4" /> Print / Download PDF
                </button>
                <button onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all text-sm">
                  New
                </button>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No complaint generated yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete the 3-step form to generate your legal draft</p>
              <div className="mt-6 flex flex-col gap-2 text-xs text-gray-300">
                <span>Step 1 → Select complaint type</span>
                <span>Step 2 → Fill in your details</span>
                <span>Step 3 → AI generates formatted complaint</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ComplaintGenerator;