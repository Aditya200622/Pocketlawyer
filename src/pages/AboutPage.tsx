import React from "react";
import { motion } from "framer-motion";
import { Code, Users, BookOpen, Sparkles } from "lucide-react";
import { TeamSection } from "../components/TeamSection";

/* ─────────────────────────────────────────────
   Google Fonts injection (Plus Jakarta Sans + DM Sans)
   Drop this style tag once at the app root if preferred
───────────────────────────────────────────── */
const FontImport: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: 'DM Sans', sans-serif;
      background-color: #FFF3E6;
    }

    /* Subtle grain texture overlay */
    .grain-overlay::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   Decorative floating orbs
───────────────────────────────────────────── */
const DecorOrb: React.FC<{
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  gradient: string;
  blur?: number;
  opacity?: number;
}> = ({ size, top, left, right, bottom, gradient, blur = 60, opacity = 0.18 }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      top,
      left,
      right,
      bottom,
      background: gradient,
      filter: `blur(${blur}px)`,
      opacity,
    }}
  />
);

/* ─────────────────────────────────────────────
   Hero / Page header
───────────────────────────────────────────── */
const PageHeader: React.FC = () => (
  <div className="relative text-center py-20 px-4 overflow-hidden">
    {/* Decorative blobs */}
    <DecorOrb
      size={320}
      top="-60px"
      left="-80px"
      gradient="radial-gradient(circle, #FF9933 0%, #FFD4A8 70%)"
      opacity={0.22}
    />
    <DecorOrb
      size={220}
      top="20px"
      right="-60px"
      gradient="radial-gradient(circle, #F97316 0%, #FBBF24 70%)"
      opacity={0.16}
    />
    <DecorOrb
      size={160}
      bottom="0px"
      left="40%"
      gradient="radial-gradient(circle, #FFB866 0%, #FFF3E6 80%)"
      opacity={0.25}
    />

    {/* Eyebrow chip */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-[#FF9933]/40 bg-white/60 backdrop-blur-sm shadow-sm"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
      <span
        className="text-xs font-semibold text-[#B45309] uppercase tracking-widest"
        style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.14em" }}
      >
        The People Behind It
      </span>
    </motion.div>

    {/* Main heading */}
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#3D2B00] leading-tight mb-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      Meet Our{" "}
      <span
        className="relative inline-block"
        style={{
          background: "linear-gradient(135deg, #FF9933 0%, #FF6B00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Dream Team
      </span>
    </motion.h1>

    {/* Subheading */}
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-xl mx-auto text-[#8A6640] text-base sm:text-lg leading-relaxed"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      Passionate builders, creators, and thinkers working together to make something extraordinary.
    </motion.p>

    {/* Decorative divider */}
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="mx-auto mt-8 h-px max-w-xs"
      style={{
        background: "linear-gradient(90deg, transparent, #FF9933 50%, transparent)",
        transformOrigin: "center",
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   Section divider
───────────────────────────────────────────── */
const SectionDivider: React.FC = () => (
  <div className="max-w-7xl mx-auto px-6">
    <div
      className="h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,153,51,0.25) 30%, rgba(255,153,51,0.25) 70%, transparent 100%)",
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   Team data
───────────────────────────────────────────── */
const techTeam = [
  {
    name: "Aditya",
    role: "Full Stack Dev",
    description: "Building core AI systems",
    image: "https://i.pravatar.cc/500?img=1",
  },
  {
    name: "Harsh",
    role: "Backend Dev",
    description: "Handles APIs & logic",
    image: "https://i.pravatar.cc/500?img=2",
  },
];

const socialTeam = [
  {
    name: "Aditya Pandey",
    role: "Marketing",
    description: "Growth & ads",
    image: "/team/adityapandey.png",
  },
  {
    name: "Sneha Sharma",
    role: "Content",
    description: "Creates content",
    image: "/team/sneha.png",
  },
  {
    name: "Anupurna Srivastava",
    role: "Design",
    description: "Brand visuals",
    image: "/team/anupurna.png",
  },
];

const researchTeam = [
  {
    name: "Ramendra Mani Tripathi",
    role: "Legal",
    description: "Case study",
    image: "/team/ramendra.png",
  },
  {
    name: "Nazia Tahseen",
    role: "Analysis",
    description: "Legal insights",
    image: "/team/naziya.png",
  },
  {
    name: "Mayank Dwivedi",
    role: "Writer",
    description: "Docs writing",
    image: "/team/mayank.png",
  },
  {
    name: "Snigdha Singh",
    role: "Policy",
    description: "Law research",
    image: "/team/snigdha.png",
  },
  {
    name: "Anupurna Srivastava",
    role: "Data",
    description: "Data handling",
    image: "/team/anupurna.png",
  },
];

/* ─────────────────────────────────────────────
   AboutPage
───────────────────────────────────────────── */
export const AboutPage: React.FC = () => {
  return (
    <>
      <FontImport />

      {/* Root wrapper — warm peach/cream background */}
      <div
        className="relative min-h-screen w-full overflow-x-hidden"
        style={{
          background:
            "linear-gradient(160deg, #FFF3E6 0%, #FFECD4 35%, #FFF7EE 65%, #FFF3E6 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Global decorative orbs — large, blurred, fixed position */}
        <DecorOrb
          size={500}
          top="8%"
          right="-10%"
          gradient="radial-gradient(circle, rgba(255,153,51,0.28) 0%, transparent 70%)"
          blur={90}
          opacity={1}
        />
        <DecorOrb
          size={400}
          top="40%"
          left="-8%"
          gradient="radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)"
          blur={80}
          opacity={1}
        />
        <DecorOrb
          size={350}
          bottom="5%"
          right="5%"
          gradient="radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)"
          blur={70}
          opacity={1}
        />

        {/* Page content */}
        <div className="relative z-10">
          {/* Page header */}
          <PageHeader />

          {/* ── Tech Team ── */}
          <TeamSection title="Tech Team" icon={Code} members={techTeam} />

          <SectionDivider />

          {/* ── Social Media Team ── */}
          <TeamSection title="Social Media Team" icon={Users} members={socialTeam} />

          <SectionDivider />

          {/* ── Research Team ── */}
          <TeamSection title="Research Team" icon={BookOpen} members={researchTeam} />

          {/* Footer spacing */}
          <div className="h-16" />
        </div>
      </div>
    </>
  );
};

export default AboutPage;