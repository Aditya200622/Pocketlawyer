import { storage } from "../firebase";
import { uploadBytesResumable } from "firebase/storage";
import AiAssistant from "./AiAssistant";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { deleteDoc } from "firebase/firestore";
import { collection, getDocs, query, where,addDoc  } from "firebase/firestore";
import { login, signup } from "../auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {  ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, Menu, X, FileText, Search, Brain, LogOut,
  Plus, ChevronRight, Upload, User,
  Briefcase, Shield, Clock, CheckCircle, AlertCircle,
  Eye, Trash2, MessageSquare, FolderOpen, Hash
} from 'lucide-react';

 
// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = 'auth' | 'dashboard';
type AuthTab = 'login' | 'signup';
type DashTab = 'overview' | 'my-cases' | 'evidence' | 'ai-assistant';
 
interface Case {
  id: string;
  title: string;
  client: string;
  type: string;
  court: string;
  status: 'active' | 'pending' | 'closed' | 'hearing';
  date: string;
  nextHearing?: string;
  priority: 'high' | 'medium' | 'low';
}
 
interface Evidence {
 
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  tag: string;
   url?: string;
   path?: string;   

}
 
interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
}
 
// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_CASES: Case[] = [
  { id: 'C001', title: 'Sharma vs. State of UP', client: 'Rajesh Sharma', type: 'Criminal', court: 'Allahabad High Court', status: 'active', date: '2024-11-10', nextHearing: '2025-04-18', priority: 'high' },
  { id: 'C002', title: 'Property Dispute — Mehta Family', client: 'Sunita Mehta', type: 'Civil', court: 'District Court, Lucknow', status: 'hearing', date: '2024-12-01', nextHearing: '2025-04-22', priority: 'high' },
  { id: 'C003', title: 'Consumer Complaint — TechMart', client: 'Anil Verma', type: 'Consumer', court: 'Consumer Forum', status: 'pending', date: '2025-01-15', priority: 'medium' },
  { id: 'C004', title: 'Labour Dispute — ABC Mills', client: 'Workers Union', type: 'Labour', court: 'Labour Court, Kanpur', status: 'active', date: '2025-02-03', nextHearing: '2025-05-01', priority: 'medium' },
  { id: 'C005', title: 'Divorce Petition — Singh', client: 'Priya Singh', type: 'Family', court: 'Family Court, Lucknow', status: 'closed', date: '2024-08-20', priority: 'low' },
];
 
const DUMMY_EVIDENCE: Evidence[] = [
  { id: 'E001', caseId: 'C001', name: 'FIR_Copy_Sharma.pdf', type: 'PDF', size: '2.4 MB', uploaded: '2024-11-12', tag: 'FIR' },
  { id: 'E002', caseId: 'C001', name: 'Witness_Statement_1.pdf', type: 'PDF', size: '1.1 MB', uploaded: '2024-11-18', tag: 'Witness' },
  { id: 'E003', caseId: 'C002', name: 'Land_Registry_Doc.jpg', type: 'Image', size: '3.7 MB', uploaded: '2024-12-05', tag: 'Property' },
  { id: 'E004', caseId: 'C002', name: 'Sale_Agreement_1998.pdf', type: 'PDF', size: '0.9 MB', uploaded: '2024-12-07', tag: 'Agreement' },
  { id: 'E005', caseId: 'C003', name: 'Bill_Invoice_TechMart.pdf', type: 'PDF', size: '0.5 MB', uploaded: '2025-01-16', tag: 'Invoice' },
  { id: 'E006', caseId: 'C004', name: 'Employment_Contract.pdf', type: 'PDF', size: '1.8 MB', uploaded: '2025-02-05', tag: 'Contract' },
];
 
const AI_SUGGESTIONS = [
  'Summarize Sharma vs. State of UP',
  'What evidence is strongest for C002?',
  'Next hearing dates for all active cases',
  'Draft a bail application for C001',
];
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  closed:  'bg-gray-100 text-gray-500',
  hearing: 'bg-orange-100 text-orange-600',
};
 
const priorityDot: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-yellow-400',
  low:    'bg-gray-300',
};
 
// ─── AI Reply Generator ───────────────────────────────────────────────────────
const getAIReply = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('sharma') || m.includes('c001')) {
    return '📁 Case C001 — Sharma vs. State of UP\n\n• Court: Allahabad High Court\n• Type: Criminal\n• Next Hearing: 18 April 2025\n• Evidence on file: FIR Copy, Witness Statement\n\nSuggested action: File bail application at least 7 days before the next hearing. The FIR copy and witness statement support the defence narrative. Shall I draft the bail application?';
  }
  if (m.includes('evidence') || m.includes('strongest')) {
    return '🔍 Strongest Evidence for Mehta Property Dispute (C002):\n\n1. Sale Agreement 1998 — establishes original ownership chain\n2. Land Registry Doc — government-stamped proof\n\nRecommendation: Present the Sale Agreement first as the primary document, supported by the Registry. Cross-examine opponent witness on the 1998 timeline.';
  }
  if (m.includes('hearing') || m.includes('date')) {
    return '📅 Upcoming Hearings:\n\n• C001 – Sharma vs UP → 18 Apr 2025 (Allahabad HC)\n• C002 – Mehta Property → 22 Apr 2025 (District Court, Lucknow)\n• C004 – Labour Dispute → 01 May 2025 (Labour Court, Kanpur)\n\nWould you like me to draft preparation notes for any of these?';
  }
  if (m.includes('bail') || m.includes('application')) {
    return '📝 Bail Application Draft — Sharma vs. State of UP\n\nIN THE HON\'BLE HIGH COURT OF JUDICATURE AT ALLAHABAD\nBail Application No. ___ of 2025\n\nIn the matter of:\nRajesh Sharma ... Applicant\nVersus\nState of Uttar Pradesh ... Respondent\n\nGROUNDS:\n1. The applicant has no prior criminal record.\n2. The FIR is based on circumstantial evidence only.\n3. All witnesses are available for examination.\n\nPRAYER: That this Hon\'ble Court may be pleased to grant bail...\n\n[Full draft ready — shall I complete and export it?]';
  }
  return '⚖️ I have access to all your cases and evidence. You can ask me to:\n\n• Summarize any case\n• Find relevant evidence\n• Draft applications or petitions\n• Check upcoming hearing dates\n• Suggest legal strategy\n\nWhat would you like to work on?';
};
 
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const CaseResearch = () => {
  const handleTestLogin = async () => {
  try {
    await login("test@gmail.com", "123456");
    alert("Login success 🚀");
  } catch (err) {
    console.error(err);
    alert((err as any).message);
  }
};
const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [screen, setScreen] = useState<Screen>('auth');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [dashTab, setDashTab] = useState<DashTab>('overview');
  const [lawyer, setLawyer] = useState({ name: 'Adv. Priya Kapoor', email: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', bar: '', password: '' });
  const [cases, setCases] = useState<Case[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filterType, setFilterType] = useState("all");
  
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [newCase, setNewCase] = useState(false);
  const [nc, setNc] = useState({ title: '', client: '', type: '', court: '' });

  useEffect(() => {
  const fetchEvidence = async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    const q = query(
      collection(db, "evidence"),
      where("userId", "==", user.uid)
    );

    const snap = await getDocs(q);

    const list: any[] = [];
    snap.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });

    setEvidence(list);
  };

  fetchEvidence();
}, []);
useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 🔥 Firestore se user data fetch
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();

        setLawyer({
          name: data.name || "User",
          email: data.email || user.email || ""
        });
      } else {
        // fallback
        setLawyer({
          name: user.email || "User",
          email: user.email || ""
        });
      }
      // 🔥 CASES LOAD KARO
      // 🔥 EVIDENCE LOAD KARO
const evRef = collection(db, "evidence");

const evQuery = query(
  evRef,
  where("userId", "==", user.uid)
);

const evSnap = await getDocs(evQuery);

const loadedEvidence = evSnap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as Evidence[];

setEvidence(loadedEvidence);
const casesRef = collection(db, "cases");

const q = query(
  casesRef,
  where("userId", "==", user.uid)
);

const snapshot = await getDocs(q);

const loadedCases = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as Case[];

setCases(loadedCases);

      setScreen('dashboard');
    }
  });

  return () => unsubscribe();
}, []);

  // ── Auth ──
const doSignup = async () => {
  try {
    if (!signupForm.email || !signupForm.password) {
      alert("Please fill all fields");
      return;
    }

    // 1. Firebase Auth signup
    const userCred = await signup(signupForm.email, signupForm.password);

    // 2. Firestore me save
  await setDoc(doc(db, "users", userCred.user.uid), {
  email: userCred.user.email,
  name: signupForm.name || "New User",
  createdAt: new Date()
});
    alert("Account created 🚀");

    // login tab pe switch
    setAuthTab("login");

  } catch (err) {
    alert((err as any).message);
  }
};
const doLogin = async () => {
  try {
    if (!loginForm.email || !loginForm.password) {
      alert("Please fill all fields");
      return;
    }

    await login(loginForm.email, loginForm.password);
    alert("Login success 🚀");

    

  } catch (err) {
    alert((err as any).message);
  }
};
const handleLogout = async () => {
  try {
    await signOut(getAuth());

    setLawyer({ name: '', email: '' });
    setScreen('auth');

    alert("Logged out 👋");
  } catch (err) {
    alert((err as any).message);
  }
};
  
 
  // ── AI ──
// 🔥 case + evidence context


  const saveEvidence = async (caseId: string, file: File) => {
  try {
    const user = getAuth().currentUser;
    if (!user) return;

    

    const storageRef = ref(storage, `evidence/${user.uid}/${file.name}`);
   

const uploadTask = uploadBytesResumable(storageRef, file);

uploadTask.on(
  "state_changed",
  (snapshot) => {
    const progress =
      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    setUploadProgress(Math.round(progress));
  },
  (error) => {
    console.error(error);
    alert("Upload failed");
  },
  async () => {
    const url = await getDownloadURL(uploadTask.snapshot.ref);
    setUploadProgress(null);

    setEvidence(prev => [
      {
        id: Date.now().toString(),
        caseId,
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + " KB",
        tag:
  file.type.includes("image")
    ? "photo evidence"
    : file.type.includes("pdf")
    ? "legal document"
    : file.type.includes("audio")
    ? "audio proof"
    : file.type.includes("video")
    ? "video evidence"
    : "file",
        uploaded: new Date().toISOString().slice(0, 10),
        url,
        path: uploadTask.snapshot.ref.fullPath
      },
      ...prev
    ]);
  }
);
  } catch (err) {
    alert((err as any).message);
  }
};
const deleteEvidence = async (ev: any) => {
  try {
    // 1. Storage se delete
    const fileRef = storageRef(storage, ev.path);
    await deleteObject(fileRef);

    // 2. Firestore se delete
    await deleteDoc(doc(db, "evidence", ev.id));
      setEvidence(prev => prev.filter(e => e.id !== ev.id));

    alert("Deleted successfully");

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};
 
  // ── Add Case ──
  
 const addCase = async () => {
  
  if (!nc.title) return;

  try {
    const user = getAuth().currentUser;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const newCase = {
      title: nc.title,
      client: nc.client,
      type: nc.type || "Civil",
      court: nc.court,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      priority: "medium",
      userId: user.uid, // 🔥 IMPORTANT (user ke cases alag rahenge)
    };

    // 🔥 Firestore save
    const docRef = await addDoc(collection(db, "cases"), newCase);

    alert("Case saved 🚀");

    // optional UI update


setCases(p => [
  { id: docRef.id, ...newCase } as any,
  ...p
]);

    setNc({ title: "", client: "", type: "", court: "" });
    setNewCase(false);

  } catch (err) {
    alert((err as any).message);
  }
};

 
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2040] to-[#1a1a2e] flex items-center justify-center p-4 relative overflow-hidden">
        {/* bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl" />
 
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
      <div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 mb-4">
<img 
  src="/favicon.ico" 
  alt="logo" 
  className="h-8 w-8 object-contain"
/>
  </div>
  <h1 className="text-3xl font-bold text-white">PocketLawyer</h1>
  <p className="text-gray-400 text-sm mt-1">Lawyer Dashboard — Case & Evidence Management</p>
<div className="mt-4">
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); window.location.href = '/'; }}
    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
    style={{ position: 'relative', zIndex: 50 }}
  >
    ← Back to Home
  </button>

</div>

</div>
          
          
 
          {/* Card */}
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-4 flex justify-center">
  
</div>
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
              {(['login', 'signup'] as AuthTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAuthTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${authTab === tab ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  {tab === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>
 
            <AnimatePresence mode="wait">
              {authTab === 'login' ? (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Email / Bar ID</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="advocate@email.com"
                      value={loginForm.email}
                      onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                    <input
                      type="password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={doLogin}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25 mt-2"
                  >
                    Login to Dashboard
                  </button>
                  
                  
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="Adv. Your Name" value={signupForm.name} onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="advocate@email.com" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Bar Council ID</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="UP/1234/2020" value={signupForm.bar} onChange={e => setSignupForm(p => ({ ...p, bar: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                    <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="••••••••" value={signupForm.password} onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <button onClick={doSignup} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25 mt-2">
                    Create Account
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }
 
  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const activeCases = cases.filter(c => c.status === 'active' || c.status === 'hearing').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const totalEvidence = evidence.length;
 
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
 
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-64 bg-[#0f1f3d] text-white flex flex-col fixed h-full z-40 shadow-2xl 
md:translate-x-0 
${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
transition-transform duration-300`}
          >
            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">PocketLawyer</span>
                  <p className="text-gray-500 text-xs">Pro Dashboard</p>
                </div>
              </div>
            </div>
 
            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {[
                { id: 'overview', icon: Hash, label: 'Overview' },
                { id: 'my-cases', icon: Briefcase, label: 'My Cases' },
                { id: 'evidence', icon: FolderOpen, label: 'Evidence Vault' },
                { id: 'ai-assistant', icon: Brain, label: 'AI Assistant' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setDashTab(item.id as DashTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${dashTab === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
 
            {/* Lawyer info */}
            <div className="px-4 py-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{lawyer.name}</p>
                  <p className="text-gray-500 text-xs truncate">{lawyer.email || 'Verified Advocate'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-500 hover:text-red-400 text-xs py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </motion.aside>
          
        )}
      </AnimatePresence>
      

{/* 👇 YE LINE ADD KARNI HAI (IMPORTANT) */}
{sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-30 md:hidden"
    onClick={() => setSidebarOpen(false)}
  />
)}
 
      {/* ── Main ── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
 
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800 text-base">
                {dashTab === 'overview' && 'Dashboard Overview'}
                {dashTab === 'my-cases' && 'My Cases'}
                {dashTab === 'evidence' && 'Evidence Vault'}
                {dashTab === 'ai-assistant' && 'AI Legal Assistant'}
              </h1>
              <p className="text-xs text-gray-400">Welcome back, {lawyer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              AI Active
            </span>
          </div>
        </div>
 
        <div className="p-6">
          <AnimatePresence mode="wait">
 
            {/* ════ OVERVIEW ════ */}
            {dashTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
 
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Cases', value: cases.length, icon: Briefcase, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                    { label: 'Active / Hearing', value: activeCases, icon: CheckCircle, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
                    { label: 'Pending', value: pendingCases, icon: Clock, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
                    { label: 'Evidence Files', value: totalEvidence, icon: Shield, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
                  ].map(s => (
                    <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
                      <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{String(s.value).padStart(2, '0')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
 
                {/* Recent cases + upcoming hearings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
                  {/* Recent cases */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-700 text-sm">Recent Cases</h2>
                      <button onClick={() => setDashTab('my-cases')} className="text-orange-500 text-xs font-medium hover:underline flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cases.slice(0, 4).map(c => (
                        <div key={c.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedCase(c); setDashTab('my-cases'); }}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[c.priority]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{c.title}</p>
                            <p className="text-xs text-gray-400">{c.client} · {c.court}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor[c.status]}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
 
                  {/* Upcoming hearings */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                      <h2 className="font-semibold text-gray-700 text-sm">Upcoming Hearings</h2>
                    </div>
                    <div className="p-4 space-y-3">
                      {cases.filter(c => c.nextHearing).map(c => (
                        <div key={c.id} className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">{c.title}</p>
                            <p className="text-xs text-orange-600 font-medium">{c.nextHearing} · {c.court}</p>
                          </div>
                        </div>
                      ))}
                      {cases.filter(c => c.nextHearing).length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">No upcoming hearings</p>
                      )}
                    </div>
                  </div>
                </div>
 
                {/* Quick AI */}
                <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1a3060] rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Brain className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm">Quick AI Query</h2>
                      <p className="text-gray-400 text-xs">Ask anything about your cases</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => { setDashTab('ai-assistant'); }} className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
 
            {/* ════ MY CASES ════ */}
            {dashTab === 'my-cases' && (
              <motion.div key="cases" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
 
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{cases.length} cases registered</p>
                  <button onClick={() => setNewCase(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                    <Plus className="h-4 w-4" /> New Case
                  </button>
                </div>
 
                {/* New case modal */}
                <AnimatePresence>
                  {newCase && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm space-y-3">
                      <h3 className="font-semibold text-gray-700 text-sm">Register New Case</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="Case Title *" value={nc.title} onChange={e => setNc(p => ({ ...p, title: e.target.value }))} />
                        <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="Client Name" value={nc.client} onChange={e => setNc(p => ({ ...p, client: e.target.value }))} />
                        <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="Case Type (Civil/Criminal...)" value={nc.type} onChange={e => setNc(p => ({ ...p, type: e.target.value }))} />
                        <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="Court Name" value={nc.court} onChange={e => setNc(p => ({ ...p, court: e.target.value }))} />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={addCase} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all">Add Case</button>
                        <button onClick={() => setNewCase(false)} className="text-gray-500 px-5 py-2 rounded-xl text-sm hover:bg-gray-100 transition-all">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
 
                {/* Case list */}
                <div className="space-y-3">
                  {cases.map(c => (
                    <motion.div
                      key={c.id}
                      layout
                      className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedCase?.id === c.id ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100'}`}
                      onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityDot[c.priority]}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-400 font-mono">{c.id}</span>
                              <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{c.client} · {c.type} · {c.court}</p>
                            {c.nextHearing && (
                              <p className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Next Hearing: {c.nextHearing}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[c.status]}`}>{c.status}</span>
                          <button onClick={() => { setDashTab('ai-assistant'); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Ask AI">
                            <Brain className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
 
                      {/* Expanded: evidence for this case */}
                      <AnimatePresence>
                        {selectedCase?.id === c.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-100 overflow-hidden">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Evidence on file</p>
                            {evidence.filter(e => e.caseId === c.id).length > 0 ? (
                              <div className="space-y-2">
                                {evidence.filter(e => e.caseId === c.id).map(ev => (
                                  <div key={ev.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 flex-1 truncate">{ev.name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{ev.tag}</span>
                                    <span className="text-xs text-gray-400">{ev.size}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">No evidence uploaded yet. <button onClick={() => setDashTab('evidence')} className="text-orange-500 underline">Upload now</button></p>
                              
                            )}
       
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
 
            {/* ════ EVIDENCE ════ */}
            {dashTab === 'evidence' && (
              <motion.div key="evidence" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
 
                {/* Upload box */}
                <div className="bg-white border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors">
                  <div className="flex gap-2 mt-4 justify-center">
  {["all", "image", "video", "audio"].map(type => (
    <button
      key={type}
      onClick={() => setFilterType(type)}
      className={`px-3 py-1 text-xs rounded-full border ${
        filterType === type
          ? "bg-orange-500 text-white"
          : "bg-white text-gray-500"
      }`}
    >
      {type}
    </button>
  ))}
</div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="mb-4">
  <label className="text-sm text-gray-500">Select Case</label>

  <select
    value={selectedCase?.id || ""}
    onChange={(e) => {
      const caseObj = cases.find(c => c.id === e.target.value);
      setSelectedCase(caseObj || null);
    }}
    className="w-full mt-1 px-3 py-2 rounded-lg border"
  >
    <option value="">-- Select Case --</option>

    {cases.map(c => (
      <option key={c.id} value={c.id}>
        {c.title}
      </option>
    ))}
  </select>
</div>
                  <p className="font-semibold text-gray-700 text-sm mb-1">Upload Evidence</p>
                  <p className="text-xs text-gray-400 mb-4">PDF, Images, Word docs — any file up to 25MB</p>
                  <label className="cursor-pointer inline-block bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all">
                    {uploadProgress !== null && (
  <div className="mt-4">
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-orange-500 h-2 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <p className="text-xs mt-1 text-gray-500">
      Uploading: {uploadProgress}%
    </p>
  </div>
)}
                    Choose Files
                    <input
  type="file"
  multiple
  className="hidden"
onChange={(e) => {
  const files = e.target.files;
  if (!files) return;

  if (!selectedCase) {
    alert("Please select a case first");
    return;
  }

 (async () => {
  for (const file of Array.from(files)) {
    await saveEvidence(selectedCase.id, file);
  }
})();

}}
/>
                  </label>
                </div>
 
                {/* Evidence list grouped by case */}
                {cases.map(c => {
                  const cEv = evidence.filter(e => {
  if (e.caseId !== c.id) return false;

  if (filterType === "all") return true;

  return e.type.toLowerCase().includes(filterType);
});
                  if (cEv.length === 0) return null;
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-orange-400" />
                        <span className="font-semibold text-gray-700 text-sm">{c.title}</span>
                        <span className="text-xs text-gray-400">({c.id})</span>
                        <span className="ml-auto text-xs text-gray-400">{cEv.length} file{cEv.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                    {cEv.map(ev => (
  <div key={ev.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
    
    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
      <FileText className="h-4 w-4 text-blue-500" />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-700 truncate">{ev.name}</p>
      <p className="text-xs text-gray-400">{ev.size} · Uploaded {ev.uploaded}</p>

      {/* ✅ IMAGE HERE */}
  {ev.type.toLowerCase().includes("image") && ev.url && (
  <img
    src={ev.url}
    onClick={() => setPreview({ url: ev.url!, type: ev.type })}
    className="mt-2 w-24 h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
  />
)}
{preview && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setPreview(null)}
  >
    <div
      className="bg-white rounded-xl p-4 max-w-3xl w-full relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ❌ Close button */}
      <button
        onClick={() => setPreview(null)}
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
      >
        ✕
      </button>

      {/* 🖼 IMAGE */}
      {preview.type.includes("image") && (
        <img
          src={preview.url}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
      )}

      {/* 📄 PDF */}
      {preview.type.includes("pdf") && (
        <iframe
          src={preview.url}
          className="w-full h-[80vh] rounded-lg"
        />
      )}
    </div>
  </div>
)}
    </div>

    <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">
      {ev.tag}
    </span>
    <button
  onClick={() => deleteEvidence(ev)}
  className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium hover:bg-red-200"
>
  Delete
</button>
<a
  href={ev.url}
  target="_blank"
  download
  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200"
>
  Download
</a>
  </div>
))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
 
    {dashTab === "ai-assistant" && (
  <AiAssistant
  cases={cases}
  evidence={evidence}
  selectedCase={selectedCase}
/>
)}
 
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
 






