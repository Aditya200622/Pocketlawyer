import { motion } from "motion/react";

export default function Hero() {
  const floatingMembers = [
    {
      image: "https://i.pinimg.com/736x/5b/0b/ff/5b0bff40f7a33731d526c4cd1dbb2372.jpg",
      name: "Adv. Aarav Sharma",
      role: "Chief Legal Officer",
      rotate: -15,
      x: "-140%",
      y: "10%",
      delay: 0.2
    },
    {
      image: "https://i.pinimg.com/1200x/27/b6/f1/27b6f10905a640d7003a7377526e6301.jpg",
      name: "Priya Iyer",
      role: "Head of Research",
      rotate: -8,
      x: "-80%",
      y: "-40%",
      delay: 0.4
    },
    {
      image: "https://i.pinimg.com/736x/1e/7e/48/1e7e48ba759353aeadc0f435465a2451.jpg",
      name: "Vikram Malhotra",
      role: "CTO",
      rotate: 8,
      x: "80%",
      y: "-40%",
      delay: 0.6
    },
    {
      image: "https://i.pinimg.com/1200x/8b/78/91/8b789117227191641fbbb00e706ad135.jpg",
      name: "Ananya Das",
      role: "Lead Designer",
      rotate: 15,
      x: "140%",
      y: "10%",
      delay: 0.8
    }
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-saffron/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-navy/5 rounded-full blur-[100px] -z-10" />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary-saffron/10 border border-primary-saffron/20 text-primary-saffron text-sm font-medium mb-6">
            The Future of Legal Tech
          </span>
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight text-secondary-navy mb-8">
            Meet the Team Behind <span className="text-primary-saffron">PocketLawyer</span>
          </h1>
          <p className="text-gray-600 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            We're a diverse group of legal experts, engineers, and researchers building 
            AI-powered legal solutions for the next billion users in India.
          </p>
        </motion.div>

        {/* Floating Cards Container */}
        <div className="relative mt-20 w-full h-20">
          {floatingMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, rotate: member.rotate - 10, x: member.x, y: member.y }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: member.rotate,
              }}
              transition={{
                opacity: { duration: 1, delay: member.delay },
                scale: { duration: 1, delay: member.delay },
                rotate: { duration: 1, delay: member.delay },
              }}
              className="absolute hidden lg:block w-64 h-80 rounded-3xl overflow-hidden bg-white p-2 shadow-xl border border-slate-100"
            >
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: member.delay + 0.5
                }}
                className="relative h-full w-full rounded-2xl overflow-hidden"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-left">
                  <p className="text-white font-bold text-lg leading-tight">{member.name}</p>
                  <p className="text-white/70 text-xs uppercase tracking-widest">{member.role}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-gray-400 text-xs uppercase tracking-[0.2em]">Scroll to explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary-saffron to-transparent" />
      </motion.div>
    </section>
  );
};
