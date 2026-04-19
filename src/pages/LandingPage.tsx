
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, FileText, Gavel, AlertCircle,
  Phone, Shield, AlertTriangle, User, ShieldAlert, Baby,
  Stethoscope, HeartPulse, Car, Flame, Wind, Train,
  MapPin, UserCheck, Brain, Ban, Vote, Droplets, Zap,
  ShoppingBag, IndianRupee, Activity, Siren, Navigation,
  ChevronRight, CheckCircle2, ClipboardList, Scale, MessageCircle, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  link: string;
  bgImage?: string;
  index: number;
}

interface HelplineCardProps {
  icon: React.ElementType;
  name: string;
  number: string;
  descEn: string;
  descHi: string;
  index: number;
}

type HelplineEntry = Omit<HelplineCardProps, 'index'>;

interface SectionWrapProps {
  children: React.ReactNode;
  className?: string;
}

/* ─────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.55, delay: i * 0.09 },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
};

const slideLeft = {
  hidden: { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ─────────────────────────────────────
   SCROLL SECTION WRAPPER
───────────────────────────────────── */
const Reveal = ({ children, className = '' }: SectionWrapProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-72px' as any });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────── */
const AnimatedNumber = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = Math.ceil(target / 90);
    const t = setInterval(() => {
      c += step;
      if (c >= target) { setCount(target); clearInterval(t); }
      else setCount(c);
    }, 18);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─────────────────────────────────────
   FEATURE CARD
───────────────────────────────────── */
const FeatureCard = ({ emoji, title, description, link, bgImage, index }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-48px' as any });
  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={scaleIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      className="relative overflow-hidden rounded-2xl group cursor-pointer bg-white border border-gray-100"
      style={{ minHeight: 300 }}
    >
      {bgImage && (
        <img src={bgImage}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          alt={title}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/50 to-black/10" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to top, rgba(10,36,99,0.82) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)' }}
      />
      <div className="relative p-6 z-10 text-white h-full flex flex-col justify-end">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-saffron/80">
          <span className="text-xl">{emoji}</span>
        </div>
        <h3 className="text-lg font-bold mb-1.5 leading-snug">{title}</h3>
        <p className="text-white/70 mb-4 text-sm leading-relaxed">{description}</p>
        <Link to={link}
          className="inline-flex items-center text-sm font-semibold text-orange-300 hover:text-orange-200 transition-colors group/lnk w-fit"
        >
          Get Started
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover/lnk:translate-x-1.5" />
        </Link>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────
   HELPLINE CARD
───────────────────────────────────── */
const HelplineCard = ({ icon: Icon, name, number, descEn, descHi, index }: HelplineCardProps) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-32px' as any });
  return (
    <motion.div
      ref={ref}
      custom={index % 6}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -3 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-green-50 p-2.5 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
          <Icon className="h-5 w-5 text-green-600" />
        </div>
        <span className="text-xl font-black text-navy tracking-tight leading-none">{number}</span>
      </div>
      <h3 className="text-sm font-bold text-navy mb-1">{name}</h3>
      <p className="text-xs text-gray-500 leading-snug mb-1 flex-grow">{descEn}</p>
      <p className="text-xs text-gray-400 italic leading-snug mb-4">{descHi}</p>
      <a href={`tel:${number}`}
        className="mt-auto w-full bg-navy text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-saffron transition-colors duration-300 group/btn"
      >
        <Phone className="h-3.5 w-3.5 group-hover/btn:animate-bounce" />
        {t('landing.emergency.callNow')}
      </a>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════ */
export const LandingPage = () => {
  const { t } = useTranslation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const fir = 345;
  const legal = 580;
  const research = 420;
  const total = fir + legal + research;

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const problemStats: string[] = [
    t('landing.problem.stat1'),
    t('landing.problem.stat2'),
    t('landing.problem.stat3'),
    t('landing.problem.stat4'),
  ];

  const features: FeatureCardProps[] = [
    { emoji: '📝', bgImage: '/card1.jpg', title: t('landing.features.feat1.title'), description: t('landing.features.feat1.description'), link: '/generate', index: 0 },
    { emoji: '⚖️', bgImage: '/card2.jpg', title: t('landing.features.feat2.title'), description: t('landing.features.feat2.description'), link: '/guidance', index: 1 },
    { emoji: '🔍', bgImage: '/card3.jpg', title: t('landing.features.feat3.title'), description: t('landing.features.feat3.description'), link: '/research', index: 2 },
    { emoji: '🛡️', bgImage: '/card4.jpg', title: t('landing.features.feat4.title'), description: t('landing.features.feat4.description'), link: '/generate', index: 3 },
    { emoji: '💬', bgImage: '/card5.jpg', title: t('landing.features.feat5.title'), description: t('landing.features.feat5.description'), link: '/guidance', index: 4 },
  ];

  const steps = [
    { num: '01', icon: ClipboardList, title: 'Describe Your Case', desc: 'Tell us what happened in simple words. No legal jargon needed. Our AI understands plain language.' },
    { num: '02', icon: Scale, title: 'AI Generates Your FIR', desc: 'Within minutes, a legally structured FIR draft is created — ready to file with Indian authorities.' },
    { num: '03', icon: Search, title: 'Get Legal Guidance', desc: 'Receive relevant IPC sections, rights information, and actionable next steps for your case.' },
    { num: '04', icon: MessageCircle, title: 'Know Your Rights', desc: 'Chat with our AI legal assistant to understand your rights, duties, and the legal process ahead.' },
  ];

  const helplines: HelplineEntry[] = [
    { icon: Shield, name: 'Police Emergency', number: '102', descEn: 'Immediate police assistance for crimes and emergencies.', descHi: 'अपराध या आपात स्थिति में पुलिस सहायता के लिए।' },
    { icon: AlertTriangle, name: 'National Emergency', number: '112', descEn: "India's integrated emergency helpline for police, fire and ambulance.", descHi: 'भारत का एकीकृत आपातकालीन नंबर जो पुलिस, फायर और एम्बुलेंस से जोड़ता है।' },
    { icon: User, name: 'Women Helpline', number: '1091', descEn: 'Support for women facing harassment or violence.', descHi: 'महिलाओं के खिलाफ हिंसा या उत्पीड़न की स्थिति में सहायता।' },
    { icon: HeartPulse, name: 'Women Domestic Violence', number: '181', descEn: 'Assistance for women facing domestic violence.', descHi: 'घरेलू हिंसा का सामना कर रही महिलाओं के लिए सहायता।' },
    { icon: ShieldAlert, name: 'Cyber Crime Helpline', number: '1930', descEn: 'Report online fraud and cyber financial crimes.', descHi: 'ऑनलाइन फ्रॉड और साइबर अपराध की शिकायत के लिए।' },
    { icon: Baby, name: 'Child Helpline', number: '1098', descEn: 'Support for children in distress or danger.', descHi: 'संकट या खतरे में बच्चों के लिए सहायता।' },
    { icon: Stethoscope, name: 'Ambulance Emergency', number: '108', descEn: 'Emergency medical and ambulance services.', descHi: 'चिकित्सा आपातकाल में एम्बुलेंस सेवा।' },
    { icon: HeartPulse, name: 'Health Helpline', number: '104', descEn: 'Government health advice and assistance services.', descHi: 'सरकारी स्वास्थ्य सलाह और सहायता सेवा।' },
    { icon: Car, name: 'Road Accident Emergency', number: '1073', descEn: 'National highway accident emergency helpline.', descHi: 'राष्ट्रीय राजमार्ग दुर्घटना सहायता हेल्पलाइन।' },
    { icon: Flame, name: 'Fire Emergency', number: '101', descEn: 'Fire brigade emergency assistance.', descHi: 'आग लगने की स्थिति में फायर ब्रिगेड सहायता।' },
    { icon: Wind, name: 'Disaster Management', number: '1078', descEn: 'Assistance during natural disasters and emergencies.', descHi: 'प्राकृतिक आपदाओं के दौरान सहायता।' },
    { icon: Train, name: 'Railway Helpline', number: '139', descEn: 'Passenger assistance and railway inquiries.', descHi: 'रेलवे यात्रियों के लिए सहायता और जानकारी।' },
    { icon: Shield, name: 'Railway Security', number: '182', descEn: 'Security assistance for railway passengers.', descHi: 'रेलवे यात्रियों की सुरक्षा के लिए हेल्पलाइन।' },
    { icon: MapPin, name: 'Tourist Helpline', number: '1363', descEn: 'Assistance for tourists across India.', descHi: 'भारत में पर्यटकों के लिए सहायता सेवा।' },
    { icon: UserCheck, name: 'Senior Citizen Helpline', number: '14567', descEn: 'Support services for senior citizens.', descHi: 'वरिष्ठ नागरिकों के लिए सहायता सेवा।' },
    { icon: Brain, name: 'Mental Health (Kiran)', number: '1800-599-0019', descEn: 'Mental health counseling and support.', descHi: 'मानसिक स्वास्थ्य सहायता और परामर्श सेवा।' },
    { icon: Ban, name: 'Anti Corruption', number: '1031', descEn: 'Report corruption related issues.', descHi: 'भ्रष्टाचार से संबंधित शिकायत दर्ज करने के लिए।' },
    { icon: Vote, name: 'Election Commission', number: '1950', descEn: 'Voter information and election assistance.', descHi: 'मतदाता जानकारी और चुनाव सहायता।' },
    { icon: Droplets, name: 'Gas Leakage Emergency', number: '1906', descEn: 'LPG gas leakage emergency assistance.', descHi: 'गैस रिसाव की स्थिति में सहायता।' },
    { icon: Zap, name: 'Electricity Complaint', number: '1912', descEn: 'Electricity service complaints and support.', descHi: 'बिजली सेवा शिकायत और सहायता।' },
    { icon: ShoppingBag, name: 'Consumer Helpline', number: '1800-11-4000', descEn: 'Assistance for consumer rights and complaints.', descHi: 'उपभोक्ता अधिकार और शिकायत सहायता।' },
    { icon: IndianRupee, name: 'Income Tax Helpline', number: '1800-180-1961', descEn: 'Assistance related to income tax queries.', descHi: 'आयकर से संबंधित सहायता।' },
    { icon: Activity, name: 'National AIDS Helpline', number: '1097', descEn: 'Information and support regarding HIV/AIDS.', descHi: 'एचआईवी/एड्स से संबंधित जानकारी और सहायता।' },
    { icon: Siren, name: 'Anti Ragging Helpline', number: '1800-180-5522', descEn: 'Report ragging incidents in educational institutions.', descHi: 'शैक्षणिक संस्थानों में रैगिंग की शिकायत के लिए।' },
    { icon: Navigation, name: 'Traffic Helpline', number: '1073', descEn: 'Report traffic incidents and highway emergencies.', descHi: 'ट्रैफिक या हाईवे दुर्घटना की सूचना देने के लिए।' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: 'Legally Accurate' },
    { icon: FileText,    label: 'FIR Ready Drafts' },
    { icon: Scale,       label: 'IPC Referenced' },
    { icon: Brain,       label: 'AI-Powered' },
    { icon: CheckCircle2,label: 'Free to Use' },
  ];

  const whyUs = [
    { icon: '⚡', title: 'Instant FIR Generation', body: 'No waiting. No middlemen. Get your FIR draft in under 3 minutes using AI trained on Indian law.' },
    { icon: '🔒', title: 'Private & Secure', body: 'Your case details never leave without your consent. End-to-end secure and completely confidential.' },
    { icon: '🌐', title: 'Available in Hindi & English', body: 'Full platform support in both languages so no one is left behind due to a language barrier.' },
    { icon: '📱', title: 'Works on Any Device', body: 'Mobile, tablet, or desktop — PocketLawyer works seamlessly across every screen.' },
    { icon: '⚖️', title: 'Covers All Major Sections', body: 'IPC, CrPC, consumer rights, cyber crime, domestic violence — all mapped and covered.' },
    { icon: '🆓', title: 'Always Free for Citizens', body: 'Core legal tools are free for every Indian citizen. Justice should never be behind a paywall.' },
  ];
  const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Citizen",
    review: "AI ne mera FIR 3 min me bana diya.",
    rating: 5,
    image: "https://i.pinimg.com/1200x/d0/96/30/d09630a68ff721c6fff999f138d33d33.jpg"
  },
  {
    name: "Anjali Verma",
    role: "Lawyer",
    review: "Client management aur drafting easy ho gaya.",
    rating: 5,
    image: "https://i.pinimg.com/736x/9a/50/7e/9a507e6cfbe07d8ee1fe75dc95679d01.jpg"
  },
  {
    name: "Vikas Gupta",
    role: "Business Owner",
    review: "Legal confusion khatam.",
    rating: 4,
    image: "https://i.pinimg.com/1200x/8d/e6/31/8de631be7fea1a5186bfe2d0aee04fae.jpg"
  },
  {
    name: "Sneha Kapoor",
    role: "Student",
    review: "IPC sections samajhna easy ho gaya.",
    rating: 5,
    image: "https://i.pinimg.com/736x/a7/1a/08/a71a08d21a60c3518f48cbf6f205b2e7.jpg"
  },
  {
    name: "Amit Singh",
    role: "Startup Founder",
    review: "Contracts aur legal docs instantly ban gaye.",
    rating: 5,
    image: "https://i.pinimg.com/736x/ec/78/71/ec7871366a9546655d9395a1dff158e9.jpg"
  },
  {
    name: "Riya Mehta",
    role: "Intern",
    review: "Research tool is insanely helpful.",
    rating: 5,
    image: "https://i.pinimg.com/736x/10/2a/89/102a898bd7bfe29393e3ec0d9f4f433b.jpg"
  },
  {
    name: "Karan Patel",
    role: "Advocate",
    review: "Dashboard ne pura workflow simplify kar diya.",
    rating: 5,
    image: "https://i.pinimg.com/1200x/a6/88/a2/a688a2b4c5f6e072101883bacdc1ef5d.jpg"
  },
];

  return (
    <div className="overflow-hidden bg-white">

      {/* ── Mouse glow ── */}
      <div className="pointer-events-none fixed inset-0 z-50"
        style={{ background: `radial-gradient(480px at ${mousePos.x}px ${mousePos.y}px, rgba(255,140,0,0.09), transparent 80%)` }}
      />

      {/* ════════════════════════════
          HERO  — Split Layout
      ════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden pt-[20px] bg-white">

        {/* Soft BG accent */}
        <div className="absolute inset-0 pointer-events-none">
          
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-24 right-[8%] w-96 h-96 bg-saffron/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-16 right-[20%] w-72 h-72 bg-green-india/8 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* LEFT — Text */}
            <div className="flex flex-col justify-center py-6 lg:py-24 order-2 lg:order-1 items-center lg:items-start text-center lg:text-left">

              <motion.span
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center justify-center lg:justify-start gap-2 px-3.5 py-1.5 mb-7 w-fit mx-auto lg:mx-0 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full tracking-wide"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {t('landing.hero.badge')}
              </motion.span>

              <motion.h1
  variants={fadeUp}
  initial="hidden"
  animate="visible"
  custom={1}
  className="text-3xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.08] mb-6 tracking-tight"
>
  AI Legal Platform for{" "}
  <span className="text-saffron">Citizens & Lawyers</span>
  <span className="block text-xl sm:text-2xl text-gray-500 font-medium mt-3">
    — From Legal Help to Complete Practice Management
  </span>
</motion.h1>

             <motion.p
  variants={fadeUp}
  initial="hidden"
  animate="visible"
  custom={2}
  className="text-base md:text-lg text-gray-600 mb-10 max-w-lg leading-relaxed"
>
  <strong>For Citizens:</strong> Draft complaints, get legal guidance, and understand your rights instantly.
  <br /><br />
  <strong>For Lawyers:</strong> Run your virtual law office with AI-powered case management, evidence tracking, and smart assistance.
</motion.p>
<motion.div
  variants={fadeUp}
  initial="hidden"
  animate="visible"
  custom={3}
  className="flex flex-col sm:flex-row gap-4 mb-12"
>
  <Link to="/generate"
    className="group flex items-center justify-center gap-2 bg-saffron text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:bg-orange-600 transition-all"
  >
    Start as Citizen ⚡
    <FileText className="h-5 w-5" />
  </Link>

  <Link to="/ai-assistant"
    className="group flex items-center justify-center gap-2 bg-white text-navy border-2 border-navy/15 px-8 py-4 rounded-xl text-base font-semibold hover:border-navy/40 transition-all"
  >
    Lawyer Dashboard (Pro)
    <Gavel className="h-5 w-5" />
  </Link>
</motion.div>

              {/* Trust micro-badges */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="flex flex-wrap gap-3"
              >
                {['FIR in 3 mins', '100% Free', 'Hindi + English', 'IPC Covered'].map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {b}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Image */}
            <motion.div
              variants={slideLeft}
              initial="hidden"
              animate="visible"
              className="relative flex items-center justify-center py-6 lg:py-20 order-1 lg:order-2 overflow-visible"
            >
              {/* Decorative frame */}
              

              {/* Main image */}
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <img src="/hero-new.png" alt="Legal assistance" className="w-full h-auto object-top" />
                  <div className="absolute inset-0 pointer-events-none" />
                </motion.div>

                {/* Floating stat card – left */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  style={{ animation: 'floatA 4s ease-in-out infinite' }}
                  className="flex absolute -left-4 top-1/4 scale-90 sm:scale-100 bg-white rounded-2xl shadow-xl p-3 sm:p-4 items-center gap-2 sm:gap-3 border border-gray-100"
                >
                  <div className="bg-saffron/10 p-2.5 rounded-xl">
                    <ShieldCheck className="h-5 w-5 text-saffron" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">AI Powered</p>
                    <p className="text-sm font-bold text-navy">Legal Protection</p>
                  </div>
                </motion.div>

                {/* Floating stat card – right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  style={{ animation: 'floatB 5s ease-in-out infinite' }}
                  className="block absolute -right-4 bottom-1/4 scale-90 sm:scale-100 bg-white rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100"
                >
                  <p className="text-2xl font-black text-navy">{total}+</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cases Handled</p>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Keyframe style tag */}
      <style>
        {`
        @keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes marquee-reverse {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.animate-marquee {
  animation: marquee 25s linear infinite;
}

.animate-marquee-reverse {
  animation: marquee-reverse 25s linear infinite;
}
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
      `}</style>

      {/* ════════════════════════════
          TRUST STRIP
      ════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {trustBadges.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-2 text-gray-600"
              >
                <Icon className="h-4 w-4 text-saffron" />
                <span className="text-sm font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          PROBLEM SECTION  — split
      ════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <Reveal>
              <motion.div variants={slideRight} className="relative">
               <div className="relative flex justify-center items-center">
  <img 
    src="/hero2.png" 
    alt="Justice" 
    className="w-full max-w-[420px] h-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
  />
</div>
                {/* Decorative corner */}
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-saffron/10 rounded-2xl -z-10" />
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-india/10 rounded-2xl -z-10" />
              </motion.div>
            </Reveal>

            {/* Text */}
            <Reveal>
              <motion.div variants={slideLeft}>
                <span className="text-xs font-bold tracking-widest text-saffron uppercase mb-3 block">The Problem</span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
                  {t('landing.problem.headline')}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-9">
                  {t('landing.problem.subheadline')}
                </p>
                <div className="space-y-3">
                  {problemStats.map((label, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={fadeUp}
                      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100/80 hover:border-red-200 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium leading-snug">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ════════════════════════════
          HOW IT WORKS — 4 Steps
      ════════════════════════════ */}
      <section className="py-24 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <span className="text-xs font-bold tracking-widest text-saffron uppercase mb-3 block">Simple Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">How It Works</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-base">
                Get legal help in four simple steps — no lawyer visits, no paperwork hassle.
              </p>
            </motion.div>
          </Reveal>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line – desktop only */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-saffron/30 to-transparent" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={i}>
                  <motion.div
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 group text-center"
                  >
                    {/* Step number */}
                    <div className="relative w-14 h-14 mx-auto mb-5">
                      <div className="w-full h-full rounded-2xl bg-navy/5 group-hover:bg-saffron/10 transition-colors duration-300 flex items-center justify-center border border-navy/10 group-hover:border-saffron/30">
                        <Icon className="h-6 w-6 text-navy group-hover:text-saffron transition-colors duration-300" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-saffron text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                        {step.num.replace('0', '')}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy mb-2 text-base leading-snug">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    {/* Arrow connector visible on mobile */}
                    {i < steps.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-300 absolute -right-3 top-12 hidden sm:block lg:hidden" />
                    )}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════
          FEATURES / SERVICES GRID
      ════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-14">
            <motion.div variants={fadeUp}>
              <span className="text-xs font-bold tracking-widest text-saffron uppercase mb-3 block">What We Offer</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">{t('landing.features.headline')}</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
                {t('landing.features.subheadline')}
              </p>
            </motion.div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(0, 3).map(f => <FeatureCard key={f.index} {...f} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:max-w-[66.66%] lg:mx-auto">
            {features.slice(3).map(f => <FeatureCard key={f.index} {...f} />)}
          </div>

        </div>
      </section>

      {/* ════════════════════════════
          WHY CHOOSE US
      ════════════════════════════ */}
      <section className="py-24 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-14">
            <motion.div variants={fadeUp}>
              <span className="text-xs font-bold tracking-widest text-saffron uppercase mb-3 block">Why Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Your Legal Growth Partner</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-base">AI-powered legal assistance helping thousands daily</p>
            </motion.div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <Reveal key={i}>
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-saffron/20 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-saffron/8 flex items-center justify-center mb-5 group-hover:bg-saffron/15 transition-colors duration-300 text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-navy text-base mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════
          STATS ROW
      ════════════════════════════ */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: total, suf: '+', label: 'Legal Tasks Completed' },
              { val: 99, suf: '%', label: 'Success Rate' },
              { val: 25, suf: '+', label: 'Emergency Helplines' },
              { val: 3, suf: ' Min', label: 'Avg. FIR Draft Time' },
            ].map((s, i) => (
              <Reveal key={i}>
                <motion.div custom={i} variants={fadeUp}>
                  <p className="text-4xl md:text-5xl font-extrabold text-saffron mb-2">
                    <AnimatedNumber target={s.val} suffix={s.suf} />
                  </p>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          EMERGENCY HELPLINES
      ════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-14">
            <motion.div variants={fadeUp}>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase mb-3 block">Emergency Support</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-2">{t('landing.emergency.headline')}</h2>
              <h3 className="text-lg font-medium text-saffron mb-3">अपने अधिकार और आपातकालीन सहायता</h3>
              <p className="text-gray-500 max-w-xl mx-auto text-base">{t('landing.emergency.subheadline')}</p>
            </motion.div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {helplines.map((h, i) => <HelplineCard key={i} index={i} {...h} />)}
          </div>

        </div>
      </section>
      {/* ════════════════════════════
    TESTIMONIAL / TRUST SECTION
════════════════════════════ */}
<section className="py-24 bg-gradient-to-br from-[#1a1a2e] via-[#2b1b12] to-[#ff9933]/80 overflow-visible relative">
<div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
<div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
  

    {/* TEXT SECTION (TOP) */}
<div className="relative z-30 max-w-7xl mx-auto px-4 mb-16 text-center">
  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
    13,679 Clients Have Placed Their Trust in Us!
  </h2>

  <p className="text-orange-100/80 mb-8 text-lg">
    Here’s what our users say about PocketLawyer
  </p>

  <button className="bg-saffron text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-orange-600 transition">
    Read Client Reviews
  </button>
</div>

{/* CARDS SECTION (BELOW) */}
<div className="relative w-full h-[600px]">
  <div className="absolute inset-0 pointer-events-none z-10">
    {[...testimonials, ...testimonials].map((t, i) => (
    <div
      key={i}
      className="absolute bg-white rounded-2xl p-5 w-[360px] shadow-2xl"
      style={{
        top: `${(i * 17) % 80}%`,
        left: `${(i * 23) % 90}%`,
        transform: `rotate(${(i % 2 === 0 ? -6 : 6)}deg)`
      }}
    >
      <img 
  src={t.image} 
  className="w-full h-40 object-cover rounded-lg mb-3"
style={{ objectPosition: "center 25%" }}
/>
      <p className="font-semibold text-navy">{t.name}</p>
      <p className="text-xs text-gray-500 mb-2">{t.role}</p>

      <div className="mb-2">
        {Array.from({ length: t.rating }).map((_, i) => (
          <span key={i}>⭐</span>
        ))}
      </div>

      <p className="text-sm text-gray-600">{t.review}</p>
    </div>
  ))}
</div>

  


    </div>

  
</section>

      {/* ════════════════════════════
          FINAL CTA
      ════════════════════════════ */}
      <section className="relative py-28 bg-navy overflow-visible">

        {/* Blobs */}
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-saffron/12 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.14, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-green-india/12 rounded-full blur-3xl pointer-events-none"
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '44px 44px' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <motion.span variants={fadeIn} custom={0}
              className="inline-block text-xs font-bold tracking-widest text-saffron/80 uppercase mb-6"
            >
              Get Started Today
            </motion.span>

            <motion.h2 variants={fadeUp} custom={1}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              {t('landing.cta.headline')}
            </motion.h2>

            <motion.p variants={fadeUp} custom={2}
              className="text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto"
            >
              {t('landing.cta.subheadline')}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/generate"
                className="group inline-flex items-center justify-center gap-2 bg-saffron text-white px-10 py-4 rounded-xl text-base font-bold hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-saffron/20 hover:shadow-saffron/40 hover:-translate-y-0.5"
              >
                {t('landing.cta.button')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link to="/guidance"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Legal Guidance
              </Link>
            </motion.div>
          </Reveal>
        </div>

      </section>

    </div>
  );
};` `