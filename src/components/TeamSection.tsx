import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

interface TeamSectionProps {
  title: string;
  icon: LucideIcon;
  members: TeamMember[];
}

/* ─────────────────────────────────────────────
   Blob palette — warm saffron / peach / amber
───────────────────────────────────────────── */
const BLOB_GRADIENTS = [
  "radial-gradient(ellipse at 60% 40%, #FF9933 0%, #FFB866 45%, #FFD9A8 100%)",
  "radial-gradient(ellipse at 40% 60%, #F97316 0%, #FBBF24 50%, #FDE68A 100%)",
  "radial-gradient(ellipse at 55% 45%, #FF6B35 0%, #FF9F5A 45%, #FFD4A8 100%)",
  "radial-gradient(ellipse at 50% 50%, #FB923C 0%, #FCD34D 50%, #FEF3C7 100%)",
  "radial-gradient(ellipse at 45% 55%, #FBBF24 0%, #F97316 40%, #FED7AA 100%)",
];

/* ─────────────────────────────────────────────
   TeamCard
───────────────────────────────────────────── */
interface TeamCardProps {
  member: TeamMember;
  index: number;
}
export const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-60px" });
  const blobGradient = BLOB_GRADIENTS[index % BLOB_GRADIENTS.length];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative flex flex-col items-center"
    >
      {/* Image wrapper */}
      <div className="relative flex items-end justify-center">
        
        {/* Small blob bottom-right */}
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 120,
            height: 120,
            bottom: "0%",
            right: "-10%",
            background: blobGradient,
            opacity: 0.6,
          }}
        />

        {/* Image */}
        <img
          src={member.image}
          alt={member.name}
          className="relative z-10 h-auto object-contain"
          style={{
            maxHeight: 620,
          }}
        />
      </div>

      {/* Name */}
      <div className="mt-3 text-center">
        <p className="font-semibold text-[#B45309] text-sm">
          {member.name}
        </p>
        <p className="text-xs text-[#9A7B4F] uppercase tracking-widest">
          {member.role}
        </p>
      </div>
    </motion.div>
  );
};
       

/* ─────────────────────────────────────────────
   TeamSection
───────────────────────────────────────────── */
export const TeamSection: React.FC<TeamSectionProps> = ({ title, icon: Icon, members }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  /* Responsive grid cols based on count */


  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, x: -24 }}
        animate={headerInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-10"
      >
        {/* Icon badge */}
        <div
          className="flex items-center justify-center rounded-2xl p-2.5 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #FF9933 0%, #FFB866 100%)",
            boxShadow: "0 4px 14px rgba(255,153,51,0.35)",
          }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#3D2B00] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {title}
        </h2>

        {/* Decorative line */}
        <div
          className="flex-1 h-px ml-2 hidden sm:block"
          style={{
            background: "linear-gradient(90deg, rgba(255,153,51,0.4) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* Cards grid */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {members.map((member, i) => (
          <TeamCard key={`${member.name}-${i}`} member={member} index={i} />
        ))}
      </div>
    </section>
  );
};

export default TeamSection;