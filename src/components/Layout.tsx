import React, { useState } from 'react';
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Gavel, FileText, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
 
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
 
const navLinks = [
  { name: "AI Drafting", path: '/generate', icon: FileText },
  { name: "Legal Guidance", path: '/guidance', icon: Gavel },
  { name: "My Dashboard", path: '/research', icon: Scale },
  { name: "Research", path: '/', icon: Search },
  { name: "About", path: '/about', icon: Info },
];
 
  return (
    <nav className="sticky top-4 z-50 px-4 w-full">
      <div className="max-w-5xl mx-auto">
 
        {/* Pill — logo + links + button sab iske andar */}
        <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-6 py-2.5">
 
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="/hero3.png"
              alt="logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-bold text-orange-500 tracking-tight">
              Pocketlawyer
            </span>
          </Link>
 
          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
 
          {/* Right side — language + button */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-gray-600 text-sm">
              <LanguageSwitcher />
            </div>
            <Link
              to="/research"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-all"
            >
            Start Your Case ⚡
            </Link>
          </div>
 
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
 
        </div>
      </div>
 
      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden max-w-5xl mx-auto mt-2 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden"
          >
            <div className="px-3 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <link.icon className="h-4 w-4 text-gray-400" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
 
export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-navy text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
         <div className="col-span-1 md:col-span-2 space-y-5">

  {/* Company Name */}
  <h2 className="text-2xl font-semibold tracking-[3px] text-white uppercase">
    +XPERTIK PVT LTD
  </h2>

  {/* Social Icons */}
  <div className="flex gap-4 text-gray-300">
    <a href="https://www.instagram.com/pocket.lawyer?igsh=YTQ3cXBlZWp4N29q" target="_blank">
      <Instagram className="hover:text-orange-400 transition hover:scale-110" />
    </a>
    <a href="https://x.com/PocketlawyerInc" target="_blank">
      <Twitter className="hover:text-orange-400 transition hover:scale-110" />
    </a>
    <a href="https://www.facebook.com/share/1CQNMH1Rrx/" target="_blank">
      <Facebook className="hover:text-orange-400 transition hover:scale-110" />
    </a>
    <a href="#" target="_blank">
      <Youtube className="hover:text-orange-400 transition hover:scale-110" />
    </a>
  </div>

  {/* Tagline */}
  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
    Empowering AI-driven legal solutions for citizens and lawyers across India.
  </p>

  {/* Logo */}
  <div>
   <img
  src="/xpertik-logo.png"
  alt="Xpertik"
  className="w-32 opacity-100"
/>
  </div>

</div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-saffron">{t('common.quickLinks')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('common.home')}</Link></li>
              <li><Link to="/generate" className="hover:text-white transition-colors">{t('common.complaintGenerator')}</Link></li>
              <li><Link to="/case-research" className="hover:text-white transition-colors">{t('common.legalGuidance')}</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">{t('common.caseResearch')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-saffron">{t('common.contact')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{t('common.supportEmail')}</li>
              <li>{t('common.location')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} PocketLawyer. {t('common.copyright')}</p>
          <p className="mt-2 text-xs">{t('common.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
};
