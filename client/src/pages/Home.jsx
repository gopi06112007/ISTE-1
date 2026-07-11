import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import api from '../api/axios';
import HomeEventCard from '../components/HomeEventCard';
import HomeBlogCard from '../components/HomeBlogCard';
import ClayCard from '../components/ui/ClayCard';
import BentoGrid from '../components/ui/BentoGrid';
import Footer from '../components/Footer';
import PageTransition from '../components/ui/PageTransition';
import SafeImage from '../components/SafeImage';

/* ─────────────────────────────────────────────────────────────
   Animated branch illustrations — unique per branch code
   ──────────────────────────────────────────────────────────── */
const BranchIllustration = ({ code, color, isHovered }) => {
  const c = color;

  if (code === 'CSE') {
    const speed = isHovered ? 0.7 : 1.4;
    const nodeScale = isHovered ? [1, 2.2, 1] : [1, 1.6, 1];
    return (
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" className="opacity-95 max-w-full">
        {/* Lines */}
        {[[30, 30, 90, 30], [90, 30, 90, 70], [90, 70, 150, 70], [150, 70, 150, 110], [30, 30, 30, 90], [30, 90, 90, 90], [90, 90, 90, 70]].map(([x1, y1, x2, y2], i) => (
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="2"
            strokeDasharray="6 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: speed, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
          />
        ))}
        {/* Nodes */}
        {[[30, 30], [90, 30], [90, 70], [150, 70], [150, 110], [30, 90], [90, 90]].map(([cx, cy], i) => (
          <motion.circle key={i} cx={cx} cy={cy} r="5" fill={c}
            animate={{ scale: nodeScale, opacity: [0.8, 1, 0.8] }}
            transition={{ duration: speed * 1.2, repeat: Infinity, delay: i * 0.15 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
      </svg>
    );
  }

  if (code === 'ECE') {
    const speed = isHovered ? 0.9 : 1.8;
    const strokeWidth = isHovered ? 3.5 : 2.5;
    return (
      <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="opacity-95 max-w-full">
        <motion.path
          d="M0 50 C20 20 40 80 60 50 C80 20 100 80 120 50 C140 20 160 80 180 50"
          stroke={c} strokeWidth={strokeWidth} fill="none"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0 65 C20 35 40 95 60 65 C80 35 100 95 120 65 C140 35 160 95 180 65"
          stroke={c} strokeWidth="1.5" strokeOpacity="0.6" fill="none"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.circle r="6" fill={c}
          animate={{ cx: [0, 60, 120, 180], cy: [50, 50, 50, 50] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    );
  }

  if (code === 'EEE') {
    const speed = isHovered ? 0.8 : 1.6;
    const boltScale = isHovered ? [0.9, 1.25, 0.9] : [0.95, 1.05, 0.95];
    return (
      <svg width="140" height="160" viewBox="0 0 140 160" fill="none" className="opacity-95 max-w-full">
        {/* Expanding rings */}
        {[0, 0.4, 0.8].map((delay, i) => (
          <motion.circle key={i} cx="70" cy="80" stroke={c} strokeWidth="1.5" fill="none"
            animate={{ r: [10, 60], opacity: [0.9, 0] }}
            transition={{ duration: speed, repeat: Infinity, delay, ease: 'easeOut' }}
          />
        ))}
        {/* Bolt */}
        <motion.path
          d="M80 20 L55 80 L72 80 L60 140 L95 65 L76 65 Z"
          fill={c}
          animate={{ opacity: [0.7, 1, 0.7], scale: boltScale }}
          transition={{ duration: speed / 2.0, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '70px 80px' }}
        />
      </svg>
    );
  }

  if (code === 'MECH') {
    const gearSpeed1 = isHovered ? 2.5 : 6;
    const gearSpeed2 = isHovered ? 1.5 : 3.6;
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="opacity-95 max-w-full">
        {/* Large gear */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: gearSpeed1, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '60px 80px' }}>
          <circle cx="60" cy="80" r="28" stroke={c} strokeWidth="3" fill="none" />
          <circle cx="60" cy="80" r="10" stroke={c} strokeWidth="2.5" fill="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
            const rad = a * Math.PI / 180;
            return <rect key={i} x={60 + 26 * Math.cos(rad) - 4} y={80 + 26 * Math.sin(rad) - 7} width="8" height="14"
              fill={c} opacity="0.9" rx="2"
              transform={`rotate(${a} ${60 + 26 * Math.cos(rad)} ${80 + 26 * Math.sin(rad)})`} />;
          })}
        </motion.g>
        {/* Small gear */}
        <motion.g animate={{ rotate: -360 }} transition={{ duration: gearSpeed2, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '108px 60px' }}>
          <circle cx="108" cy="60" r="18" stroke={c} strokeWidth="2.5" fill="none" />
          <circle cx="108" cy="60" r="6" stroke={c} strokeWidth="2" fill="none" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => {
            const rad = a * Math.PI / 180;
            return <rect key={i} x={108 + 16 * Math.cos(rad) - 3} y={60 + 16 * Math.sin(rad) - 5} width="6" height="10"
              fill={c} opacity="0.9" rx="1.5"
              transform={`rotate(${a} ${108 + 16 * Math.cos(rad)} ${60 + 16 * Math.sin(rad)})`} />;
          })}
        </motion.g>
      </svg>
    );
  }

  if (code === 'CIVIL') {
    const buildSpeed = isHovered ? 0.8 : 1.6;
    const windowSpeed = isHovered ? 0.6 : 1.2;
    return (
      <svg width="160" height="150" viewBox="0 0 160 150" fill="none" className="opacity-95 max-w-full">
        {/* Ground */}
        <line x1="10" y1="140" x2="150" y2="140" stroke={c} strokeWidth="2.5" />
        {/* Buildings rising */}
        {[
          { x: 20, w: 30, maxH: 90, delay: 0 },
          { x: 60, w: 40, maxH: 120, delay: 0.2 },
          { x: 110, w: 28, maxH: 70, delay: 0.4 },
        ].map((b, i) => (
          <motion.rect key={i} x={b.x} width={b.w} fill={c} rx="2"
            animate={{ height: [0, b.maxH], y: [140, 140 - b.maxH] }}
            transition={{ duration: buildSpeed, repeat: Infinity, repeatType: 'mirror', delay: b.delay, ease: 'easeInOut' }}
          />
        ))}
        {/* Windows */}
        {[[68, 95], [68, 110], [78, 95], [78, 110], [68, 80], [78, 80]].map(([wx, wy], i) => (
          <motion.rect key={i} x={wx} y={wy} width="6" height="6" rx="1" fill="#EEF1F5"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: windowSpeed, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </svg>
    );
  }

  if (code === 'IT') {
    const flashSpeed = isHovered ? 0.45 : 0.9;
    const packetSpeed = isHovered ? 0.8 : 1.6;
    return (
      <svg width="160" height="150" viewBox="0 0 160 150" fill="none" className="opacity-95 max-w-full">
        {/* Server rack */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x="30" y={20 + i * 28} width="80" height="20" rx="3" stroke={c} strokeWidth="2" fill="none" />
            <motion.circle cx="42" cy={30 + i * 28} r="4.5" fill={c}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: flashSpeed, repeat: Infinity, delay: i * 0.15 }}
            />
            <rect x="52" y={25 + i * 28} width="40" height="3" rx="1" fill={c} opacity="0.4" />
            <rect x="52" y={32 + i * 28} width="28" height="3" rx="1" fill={c} opacity="0.3" />
          </g>
        ))}
        {/* Data packets travelling right */}
        {[0, 0.5, 1.0].map((delay, i) => (
          <motion.circle key={i} cy={115 + i * 12} r="3" fill={c}
            animate={{ cx: [10, 150] }}
            transition={{ duration: packetSpeed, repeat: Infinity, ease: 'linear', delay }}
          />
        ))}
      </svg>
    );
  }

  return null;
};

/* ─────────────────────────────────────────────────────────────
   BranchCard — 3-layer card with Unsplash bg + hover reveal
   ──────────────────────────────────────────────────────────── */
const BranchCard = ({ branch, isLarge = false, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ClayCard
      variant="raised"
      tint={branch.code}
      interactive={true}
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col h-full w-full items-center justify-center p-3.5 sm:p-4.5 text-center select-none min-h-[140px] sm:min-h-[150px]"
    >
      {/* SVG illustration badge */}
      <motion.div
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#EEF1F5] flex items-center justify-center shadow-clay-inset flex-shrink-0 mb-2.5"
        animate={isHovered ? { y: [0, -4, 0] } : {}}
        transition={{ repeat: isHovered ? Infinity : 0, duration: 0.8, ease: "easeInOut" }}
      >
        <BranchIllustration code={branch.code} color={branch.color} isHovered={isHovered} />
      </motion.div>

      <div className="flex flex-col items-center">
        <h3 className="text-slate-800 text-lg sm:text-xl font-extrabold mb-0.5">{branch.code}</h3>
        <p className="text-slate-700 text-xxs sm:text-xs font-bold line-clamp-1">{branch.fullName}</p>
        <p className="text-slate-500 text-[10px] sm:text-xxs mt-1 line-clamp-2 leading-relaxed font-semibold max-w-[200px]">
          {branch.tagline}
        </p>
      </div>
    </ClayCard>
  );
};

/* ─────────────────────────────────────────────────────────────
   UpcomingEventsSection — horizontal scroll carousel
   ──────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const UpcomingEventsSection = ({ events, loading }) => {
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const wheelTimeout = useRef(null);

  const handlePrev = () => {
    if (events.length <= 1) return;
    setActiveIdx((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (events.length <= 1) return;
    setActiveIdx((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  /* ── Trackpad two-finger swipe handling (deltaX detection) ── */
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 25) {
      if (wheelTimeout.current) return;
      if (e.deltaX > 25) {
        handleNext();
      } else {
        handlePrev();
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 400);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, []);

  /* ── Scroll boundary detection for mobile ── */
  const checkScrollBounds = useCallback(() => {
    // Stub
  }, []);

  /* ── Mobile dot indicators via IntersectionObserver ── */
  useEffect(() => {
    if (!scrollRef.current || events.length === 0) return;
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cards.indexOf(entry.target);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: 0.6 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [events]);

  const scrollToDot = (idx) => {
    const card = cardRefs.current[idx];
    if (card && scrollRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  /* ── Custom Tactile Arrow Button ── */
  const ArrowBtn = ({ direction }) => (
    <button
      onClick={direction === -1 ? handlePrev : handleNext}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/70 hover:bg-white border border-white/60 shadow-clay-md hover:scale-110 active:scale-90"
      aria-label={direction === -1 ? 'Scroll left' : 'Scroll right'}
    >
      <svg className="w-6 h-6 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === -1
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        }
      </svg>
    </button>
  );

  return (
    <section className="min-h-screen flex flex-col justify-start pt-28 md:pt-32 pb-10 snap-start snap-always relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <span className="block text-xs font-semibold tracking-widest uppercase text-[#1A56DB] mb-2">
              Upcoming Events
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-800 leading-tight">
              What's <span className="text-[#1A56DB]">Happening</span> Next
            </h2>
            <p className="text-slate-500 text-sm mt-1">Don't miss what's happening across ISTE GMRIT</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1A56DB]/30 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white transition-all duration-300 text-sm font-semibold group"
            >
              View All Events
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          /* Skeleton loader */
          <div className="events-scroll">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="events-scroll-card h-[420px] rounded-[1.25rem] bg-gray-100/60 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {/* Calendar SVG illustration */}
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#1A56DB]">
                <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <path d="M6 20h36" stroke="currentColor" strokeWidth="2.5" />
                <path d="M16 6v8M32 6v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <text x="24" y="37" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="700" fontFamily="sans-serif">?</text>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No upcoming events right now</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Check back soon — events are added regularly.</p>
            <Link
              to="/events?status=past"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#1A56DB] text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white text-sm font-semibold transition-all duration-300"
            >
              View Past Events
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Mobile layout - scroll (untouched!) */}
            <div className="sm:hidden w-full overflow-hidden">
              <div
                ref={scrollRef}
                className="events-scroll"
              >
                {events.map((event, index) => (
                  <div
                    key={event._id}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className="events-scroll-card"
                  >
                    <HomeEventCard event={event} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                {events.map((_, idx) => (
                  <button
                    key={idx}
                    className={`events-dot ${idx === activeIdx ? 'active' : ''}`}
                    onClick={() => scrollToDot(idx)}
                    aria-label={`Go to event ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop/Tablet layout - centered 3D loop slider */}
            <div
              className="hidden sm:flex relative w-full h-[460px] items-center justify-center overflow-hidden"
              onWheel={handleWheel}
              style={{ perspective: 1200 }}
            >
              {/* Left Arrow - Side placement */}
              {events.length > 1 && (
                <div className="absolute left-2 lg:left-6 z-40">
                  <ArrowBtn direction={-1} />
                </div>
              )}

              {/* Slider tracks */}
              <div className="relative flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {events.map((event, index) => {
                  let diff = index - activeIdx;
                  const count = events.length;
                  if (diff > Math.floor(count / 2)) diff -= count;
                  if (diff < -Math.floor(count / 2)) diff += count;

                  const isVisible = Math.abs(diff) <= 2;
                  if (!isVisible) return null;

                  const translateX = diff * 330;
                  const rotateY = diff * -25;
                  const translateZ = Math.abs(diff) * -140;
                  const scale = diff === 0 ? 1 : 0.82;
                  const opacity = diff === 0 ? 1 : 0.45;
                  const zIndex = diff === 0 ? 30 : 10;

                  return (
                    <motion.div
                      key={event._id}
                      className="absolute w-[300px] h-[380px] flex-shrink-0 cursor-pointer"
                      style={{
                        x: translateX,
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        scale: scale,
                        opacity: opacity,
                        zIndex: zIndex,
                        rotateY: rotateY,
                        z: translateZ,
                        y: diff === 0 ? 0 : 20,
                      }}
                      drag={diff === 0 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        const threshold = 55;
                        if (info.offset.x < -threshold) {
                          handleNext();
                        } else if (info.offset.x > threshold) {
                          handlePrev();
                        }
                      }}
                      transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.75 }}
                      onClick={() => {
                        if (diff !== 0) {
                          setActiveIdx(index);
                        }
                      }}
                    >


                      <div className={diff === 0 ? 'pointer-events-auto' : 'pointer-events-none'}>
                        <HomeEventCard event={event} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Arrow - Side placement */}
              {events.length > 1 && (
                <div className="absolute right-2 lg:right-6 z-40">
                  <ArrowBtn direction={1} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-[#1A56DB] text-sm font-semibold"
          >
            View All Events →
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   LatestBlogSection — horizontal scroll carousel for blog posts
   ──────────────────────────────────────────────────────────── */
const blogContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const blogCardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const LatestBlogSection = ({ posts, loading }) => {
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const wheelTimeout = useRef(null);

  const handlePrev = () => {
    if (posts.length <= 1) return;
    setActiveIdx((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (posts.length <= 1) return;
    setActiveIdx((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
  };

  /* ── Trackpad horizontal swipe handling (deltaX detection) ── */
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 25) {
      if (wheelTimeout.current) return;
      if (e.deltaX > 25) {
        handleNext();
      } else {
        handlePrev();
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 400);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, []);

  /* ── Mobile dot indicators via IntersectionObserver ── */
  useEffect(() => {
    if (!scrollRef.current || posts.length === 0) return;
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cards.indexOf(entry.target);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: 0.6 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [posts]);

  const scrollToDot = (idx) => {
    const card = cardRefs.current[idx];
    if (card && scrollRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  /* ── Custom Tactile Arrow Button ── */
  const ArrowBtn = ({ direction }) => (
    <button
      onClick={direction === -1 ? handlePrev : handleNext}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/70 hover:bg-white border border-white/60 shadow-clay-md hover:scale-110 active:scale-90"
      aria-label={direction === -1 ? 'Scroll left' : 'Scroll right'}
    >
      <svg className="w-6 h-6 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === -1
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        }
      </svg>
    </button>
  );

  return (
    <section className="min-h-screen flex flex-col justify-start pt-28 md:pt-32 pb-10 snap-start snap-always relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <span className="block text-xs font-semibold tracking-widest uppercase text-[#1A56DB] mb-2">
              Latest From The Blog
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-800 leading-tight">
              Latest <span className="text-[#1A56DB]">Posts</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Announcements, achievements, and insights from ISTE GMRIT</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1A56DB]/30 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white transition-all duration-300 text-sm font-semibold group"
            >
              View All Posts
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="blog-scroll">
            {[1, 2, 3].map((i) => (
              <div key={i} className="blog-scroll-card h-[480px] rounded-[1.25rem] bg-gray-100/60 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#1A56DB]">
                <path d="M6 12c0-2 2-4 6-4 4 0 8 2 12 6 4-4 8-6 12-6 4 0 6 2 6 4v24c0 2-2 3-6 3-4 0-8 2-12 5-4-3-8-5-12-5-4 0-6-1-6-3V12z"
                  stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                <path d="M24 18v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No posts yet</h3>
            <p className="text-slate-400 text-sm max-w-xs">The central coordinator will publish updates here soon.</p>
          </motion.div>
        ) : (
          <>
            {/* Mobile layout - scroll (untouched!) */}
            <div className="sm:hidden w-full overflow-hidden">
              <div
                ref={scrollRef}
                className="blog-scroll"
              >
                {posts.map((blog, index) => (
                  <div
                    key={blog._id}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className="blog-scroll-card"
                  >
                    <HomeBlogCard blog={blog} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                {posts.map((_, idx) => (
                  <button
                    key={idx}
                    className={`events-dot ${idx === activeIdx ? 'active' : ''}`}
                    onClick={() => scrollToDot(idx)}
                    aria-label={`Go to post ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop/Tablet layout - centered 3D loop slider */}
            <div
              className="hidden sm:flex relative w-full h-[420px] items-center justify-center overflow-hidden"
              onWheel={handleWheel}
              style={{ perspective: 1200 }}
            >
              {/* Left Arrow - Side placement */}
              {posts.length > 1 && (
                <div className="absolute left-2 lg:left-6 z-40">
                  <ArrowBtn direction={-1} />
                </div>
              )}

              {/* Slider tracks */}
              <div className="relative flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {posts.map((blog, index) => {
                  let diff = index - activeIdx;
                  const count = posts.length;
                  if (diff > Math.floor(count / 2)) diff -= count;
                  if (diff < -Math.floor(count / 2)) diff += count;

                  const isVisible = Math.abs(diff) <= 2;
                  if (!isVisible) return null;

                  const translateX = diff * 330;
                  const rotateY = diff * -25;
                  const translateZ = Math.abs(diff) * -140;
                  const scale = diff === 0 ? 1 : 0.82;
                  const opacity = diff === 0 ? 1 : 0.45;
                  const zIndex = diff === 0 ? 30 : 10;

                  return (
                    <motion.div
                      key={blog._id}
                      className="absolute w-[300px] h-[350px] flex-shrink-0 cursor-pointer"
                      style={{
                        x: translateX,
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        scale: scale,
                        opacity: opacity,
                        zIndex: zIndex,
                        rotateY: rotateY,
                        z: translateZ,
                        y: diff === 0 ? 0 : 20,
                      }}
                      drag={diff === 0 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        const threshold = 55;
                        if (info.offset.x < -threshold) {
                          handleNext();
                        } else if (info.offset.x > threshold) {
                          handlePrev();
                        }
                      }}
                      transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.75 }}
                      onClick={() => {
                        if (diff !== 0) {
                          setActiveIdx(index);
                        }
                      }}
                    >


                      <div className={diff === 0 ? 'pointer-events-auto' : 'pointer-events-none'}>
                        <HomeBlogCard blog={blog} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Arrow - Side placement */}
              {posts.length > 1 && (
                <div className="absolute right-2 lg:right-6 z-40">
                  <ArrowBtn direction={1} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#1A56DB] text-sm font-semibold"
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   IndividualPhotoCell — component for each photo in the bento grid
   ──────────────────────────────────────────────────────────── */
const IndividualPhotoCell = ({ src, albumName, branch, onClick, index }) => {
  const [hasError, setHasError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getBranchColorStart = (b) => {
    const colors = {
      CSE: '#3B82F6',   // blue-500
      ECE: '#8B5CF6',   // purple-500
      EEE: '#F59E0B',   // amber-500
      MECH: '#64748B',  // slate-500
      CIVIL: '#14B8A6', // teal-500
      IT: '#EC4899',    // pink-500
    };
    return colors[b] || '#1A56DB';
  };

  const getBranchColorEnd = (b) => {
    const colors = {
      CSE: '#4F46E5',   // indigo-600
      ECE: '#7C3AED',   // violet-600
      EEE: '#EA580C',   // orange-600
      MECH: '#334155',  // slate-700
      CIVIL: '#0891B2', // cyan-600
      IT: '#E11D48',    // rose-600
    };
    return colors[b] || '#7C3AED';
  };

  const start = getBranchColorStart(branch);
  const end = getBranchColorEnd(branch);

  if (!src || hasError) {
    return (
      <div
        onClick={() => onClick(index)}
        className="w-full h-full relative cursor-pointer flex flex-col items-center justify-center p-4 transition-transform duration-300 hover:scale-[1.05] rounded-clay-sm shadow-clay-sm"
        style={{
          background: `linear-gradient(135deg, ${start}, ${end})`,
        }}
      >
        <span className="text-white text-lg font-extrabold tracking-wide select-none">
          {branch}
        </span>
        <svg className="w-5 h-5 text-white/40 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden cursor-pointer rounded-clay-sm shadow-clay-sm"
      onClick={() => onClick(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={`${albumName} photo`}
        className="w-full h-full object-cover object-center rounded-clay-sm"
        onError={() => setHasError(true)}
        loading="lazy"
      />
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 pointer-events-none ${hovered ? 'opacity-100' : 'opacity-0'
          }`}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   BentoAlbumCard — tall card showing a bento layout of photos
   ──────────────────────────────────────────────────────────── */
const BentoAlbumCard = ({ album, onPhotoClick, isMobile = false }) => {
  const photos = album.photos || [];
  const totalCount = photos.length;
  const shownCount = isMobile ? Math.min(totalCount, 1) : Math.min(totalCount, 3);
  const extraCount = totalCount - shownCount;
  const badgeText = extraCount > 0 ? `+${extraCount} more` : `${totalCount} photo${totalCount !== 1 ? 's' : ''}`;

  return (
    <ClayCard
      variant="raised"
      className="group flex flex-col h-full w-full overflow-hidden p-3.5 hover:-translate-y-1.5 duration-300 transition-all cursor-pointer"
    >
      {/* ── Photo Grid Area inside clay-inset frame with padding ── */}
      <div className={`w-full relative flex flex-col overflow-hidden bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-2 ${isMobile ? 'aspect-square' : 'flex-1'}`}>
        {/* Photo count badge overlaid top-right */}
        {photos.length > 0 && (
          <div className="absolute top-4 right-4 z-10 bg-[#EEF1F5]/85 text-slate-700 text-xs px-2.5 py-1 rounded-clay-sm shadow-clay-sm font-bold">
            {badgeText}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/50 rounded-clay-sm">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-400 mt-2 font-bold">No photos</span>
          </div>
        ) : isMobile ? (
          <div className="w-full h-full">
            <IndividualPhotoCell
              src={photos[0]}
              albumName={album.albumName}
              branch={album.branch}
              onClick={(idx) => onPhotoClick(album, idx)}
              index={0}
            />
          </div>
        ) : photos.length === 1 ? (
          <div className="w-full h-full">
            <IndividualPhotoCell
              src={photos[0]}
              albumName={album.albumName}
              branch={album.branch}
              onClick={(idx) => onPhotoClick(album, idx)}
              index={0}
            />
          </div>
        ) : photos.length === 2 ? (
          <div className="w-full h-full flex flex-col gap-2">
            <div className="h-[55%]">
              <IndividualPhotoCell
                src={photos[0]}
                albumName={album.albumName}
                branch={album.branch}
                onClick={(idx) => onPhotoClick(album, idx)}
                index={0}
              />
            </div>
            <div className="h-[45%]">
              <IndividualPhotoCell
                src={photos[1]}
                albumName={album.albumName}
                branch={album.branch}
                onClick={(idx) => onPhotoClick(album, idx)}
                index={1}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-2">
            <div className="h-[55%]">
              <IndividualPhotoCell
                src={photos[0]}
                albumName={album.albumName}
                branch={album.branch}
                onClick={(idx) => onPhotoClick(album, idx)}
                index={0}
              />
            </div>
            <div className="h-[45%] flex gap-2">
              <div className="w-1/2 h-full">
                <IndividualPhotoCell
                  src={photos[1]}
                  albumName={album.albumName}
                  branch={album.branch}
                  onClick={(idx) => onPhotoClick(album, idx)}
                  index={1}
                />
              </div>
              <div className="w-1/2 h-full">
                <IndividualPhotoCell
                  src={photos[2]}
                  albumName={album.albumName}
                  branch={album.branch}
                  onClick={(idx) => onPhotoClick(album, idx)}
                  index={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Album Footer ── */}
      <div className="flex items-center justify-between px-2 pt-4 bg-transparent flex-shrink-0 font-bold">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-slate-800 text-sm truncate" title={album.albumName}>
            {album.albumName}
          </span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-clay-sm uppercase flex-shrink-0 ${
            album.branch === 'CSE' ? 'bg-[#EEF1F5] text-blue-600 shadow-clay-inset' :
            album.branch === 'ECE' ? 'bg-[#EEF1F5] text-purple-600 shadow-clay-inset' :
            album.branch === 'EEE' ? 'bg-[#EEF1F5] text-amber-600 shadow-clay-inset' :
            album.branch === 'MECH' ? 'bg-[#EEF1F5] text-slate-600 shadow-clay-inset' :
            album.branch === 'CIVIL' ? 'bg-[#EEF1F5] text-teal-600 shadow-clay-inset' :
            album.branch === 'IT' ? 'bg-[#EEF1F5] text-pink-600 shadow-clay-inset' :
            'bg-[#EEF1F5] text-indigo-600 shadow-clay-inset'
          }`}>
            {album.branch}
          </span>
        </div>
        <Link
          to={`/gallery?album=${album._id}`}
          className="text-xs font-bold text-iste-blue hover:text-blue-700 whitespace-nowrap flex-shrink-0 ml-2"
        >
          View Album →
        </Link>
      </div>
    </ClayCard>
  );
};

/* ─────────────────────────────────────────────────────────────
   LightboxModal — full-screen media viewer
   ──────────────────────────────────────────────────────────── */
const LightboxModal = ({ isOpen, currentAlbumPhotos, currentIndex, albumName, branch, onClose, onNext, onPrev }) => {
  const activePhoto = currentAlbumPhotos[currentIndex] || '';
  const totalPhotos = currentAlbumPhotos.length;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const delta = touchStartX.current - touchEndX.current;
    if (delta > 50) {
      onNext(); // swipe left -> next
    } else if (delta < -50) {
      onPrev(); // swipe right -> prev
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background scrim */}
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      {/* Floating clay-lg card */}
      <ClayCard
        variant="raised"
        size="lg"
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#EEF1F5] shadow-clay-lg flex flex-col overflow-hidden z-10 p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top-right close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
          aria-label="Close lightbox"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows (clay-pressed style) */}
        {totalPhotos > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden md:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden md:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Container with clay-inset style */}
        <div className="flex-grow flex items-center justify-center bg-[#EEF1F5] rounded-clay-md shadow-clay-inset p-4 relative overflow-hidden" style={{ minHeight: '300px' }}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={activePhoto}
              alt={`${albumName} photo ${currentIndex + 1}`}
              className="max-w-full max-h-[55vh] object-contain rounded-clay-sm"
              draggable="false"
            />
          </motion.div>
        </div>

        {/* Bottom caption bar */}
        <div className="w-full py-4 px-2 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left mt-2 font-bold">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900">{albumName}</h4>
            <p className="text-sm text-slate-500 font-bold">Photo {currentIndex + 1} of {totalPhotos}</p>
          </div>
          {branch && (
            <span className="text-xs font-bold px-3 py-1 rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm uppercase">
              {branch}
            </span>
          )}
        </div>
      </ClayCard>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   GalleryHighlightsSection — 3-column bento album cards and carousel
   ──────────────────────────────────────────────────────────── */
const galleryContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const galleryCardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const GalleryHighlightsSection = ({ albums, loading }) => {
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const wheelTimeout = useRef(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxAlbumName, setLightboxAlbumName] = useState('');
  const [lightboxBranch, setLightboxBranch] = useState('');

  const openLightbox = (album, index) => {
    setLightboxPhotos(album.photos || []);
    setLightboxIndex(index);
    setLightboxAlbumName(album.albumName || '');
    setLightboxBranch(album.branch || '');
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextPhoto = () => {
    if (lightboxPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % lightboxPhotos.length);
  };

  const prevPhoto = () => {
    if (lightboxPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
  };

  const displayAlbums = albums.slice(0, 5);

  const handlePrev = () => {
    if (displayAlbums.length <= 1) return;
    setActiveIdx((prev) => (prev === 0 ? displayAlbums.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displayAlbums.length <= 1) return;
    setActiveIdx((prev) => (prev === displayAlbums.length - 1 ? 0 : prev + 1));
  };

  /* ── Trackpad horizontal swipe handling (deltaX detection) ── */
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 25) {
      if (wheelTimeout.current) return;
      if (e.deltaX > 25) {
        handleNext();
      } else {
        handlePrev();
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 400);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, []);

  /* ── Mobile dot indicators via IntersectionObserver ── */
  useEffect(() => {
    if (!scrollRef.current || albums.length === 0) return;
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cards.indexOf(entry.target);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: 0.6 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [albums]);

  const scrollToDot = (idx) => {
    const card = cardRefs.current[idx];
    if (card && scrollRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  /* ── Custom Tactile Arrow Button ── */
  const ArrowBtn = ({ direction }) => (
    <button
      onClick={direction === -1 ? handlePrev : handleNext}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/70 hover:bg-white border border-white/60 shadow-clay-md hover:scale-110 active:scale-90"
      aria-label={direction === -1 ? 'Scroll left' : 'Scroll right'}
    >
      <svg className="w-6 h-6 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === -1
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        }
      </svg>
    </button>
  );

  return (
    <section className="min-h-screen flex flex-col justify-start pt-28 md:pt-32 pb-10 snap-start snap-always relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <span className="block text-xs font-semibold tracking-widest uppercase text-[#1A56DB] mb-2">
              Gallery Highlights
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-800 leading-tight">
              Moments <span className="text-violet-600">Captured</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Snapshots from events, workshops, and achievements across GMRIT</p>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1A56DB]/30 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white transition-all duration-300 text-sm font-semibold group"
          >
            View Gallery
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[300px] sm:h-[360px] lg:h-[420px] rounded-[1.25rem] bg-gray-100/60 animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-clay-sm flex items-center justify-center mb-5 bg-[#EEF1F5] shadow-clay-sm">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-1">No photos yet</h3>
            <p className="text-slate-400 text-sm max-w-xs">Gallery albums will appear here once events are photographed.</p>
          </motion.div>
        ) : (
          <>
            {/* Mobile layout - scroll (untouched!) */}
            <div className="sm:hidden relative w-full overflow-hidden">
              <div
                ref={scrollRef}
                className="events-scroll"
              >
                {albums.map((album, index) => (
                  <div
                    key={album._id}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className="events-scroll-card"
                  >
                    <BentoAlbumCard album={album} onPhotoClick={openLightbox} isMobile={true} />
                  </div>
                ))}
              </div>

              {/* Mobile dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {albums.map((_, idx) => (
                  <button
                    key={idx}
                    className={`events-dot ${idx === activeIdx ? 'active' : ''}`}
                    onClick={() => scrollToDot(idx)}
                    aria-label={`Go to album ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop/Tablet layout - centered 3D loop slider */}
            <div
              className="hidden sm:flex relative w-full h-[460px] items-center justify-center overflow-hidden"
              onWheel={handleWheel}
              style={{ perspective: 1200 }}
            >
              {/* Left Arrow - Side placement */}
              {displayAlbums.length > 1 && (
                <div className="absolute left-2 lg:left-6 z-40">
                  <ArrowBtn direction={-1} />
                </div>
              )}

              {/* Slider tracks */}
              <div className="relative flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {displayAlbums.map((album, index) => {
                  let diff = index - activeIdx;
                  const count = displayAlbums.length;
                  if (diff > Math.floor(count / 2)) diff -= count;
                  if (diff < -Math.floor(count / 2)) diff += count;

                  const isVisible = Math.abs(diff) <= 2;
                  if (!isVisible) return null;

                  const translateX = diff * 290;
                  const rotateY = diff * -25;
                  const translateZ = Math.abs(diff) * -140;
                  const scale = diff === 0 ? 1 : 0.82;
                  const opacity = diff === 0 ? 1 : 0;
                  const zIndex = diff === 0 ? 30 : 10;

                  return (
                    <motion.div
                      key={album._id}
                      className="absolute w-[270px] h-[350px] flex-shrink-0 cursor-pointer"
                      style={{
                        x: translateX,
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        scale: scale,
                        opacity: opacity,
                        zIndex: zIndex,
                        rotateY: rotateY,
                        z: translateZ,
                        y: diff === 0 ? 0 : 20,
                      }}
                      drag={diff === 0 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        const threshold = 55;
                        if (info.offset.x < -threshold) {
                          handleNext();
                        } else if (info.offset.x > threshold) {
                          handlePrev();
                        }
                      }}
                      transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.75 }}
                      onClick={() => {
                        if (diff !== 0) {
                          setActiveIdx(index);
                        }
                      }}
                    >


                      <div className={diff === 0 ? 'pointer-events-auto' : 'pointer-events-none'}>
                        <BentoAlbumCard album={album} onPhotoClick={openLightbox} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Arrow - Side placement */}
              {displayAlbums.length > 1 && (
                <div className="absolute right-2 lg:right-6 z-40">
                  <ArrowBtn direction={1} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-[#1A56DB] text-sm font-semibold"
          >
            View Gallery →
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        currentAlbumPhotos={lightboxPhotos}
        currentIndex={lightboxIndex}
        albumName={lightboxAlbumName}
        branch={lightboxBranch}
        onClose={closeLightbox}
        onNext={nextPhoto}
        onPrev={prevPhoto}
      />
    </section>
  );
};

const animLetters = (text) => {
  return text.split('').map((char, index) => {
    if (char === ' ') return <span key={index} className="inline-block">&nbsp;</span>;
    return (
      <motion.span
        key={index}
        className="inline-block text-iste-blue cursor-default select-none"
        whileHover={{ y: -8, scale: 1.25, color: '#0D9488' }}
        transition={{ type: 'spring', stiffness: 450, damping: 10 }}
      >
        {char}
      </motion.span>
    );
  });
};

const CountUp = ({ value, duration = 1500 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  const numericString = value.replace(/[^0-9]/g, '');
  const target = parseInt(numericString, 10) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        setCount(end);
        return;
      }

      const progress = elapsed / duration;
      const easeProgress = progress * (2 - progress); // easeOutQuad

      setCount(Math.floor(easeProgress * (end - start) + start));
      requestAnimationFrame(updateCount);
    };

    requestAnimationFrame(updateCount);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  const [branches, setBranches] = useState([
    {
      code: 'CSE',
      fullName: 'Computer Science & Engineering',
      tagline: 'Building the digital future through code, algorithms, and innovation.',
      color: '#1A56DB',
      bgImage: 'https://source.unsplash.com/featured/800x600/?circuit+board,technology',
    },
    {
      code: 'ECE',
      fullName: 'Electronics & Communication Engineering',
      tagline: 'Connecting the world through signals, systems, and smart devices.',
      color: '#7C3AED',
      bgImage: 'https://source.unsplash.com/featured/800x600/?electronics,circuit,communication',
    },
    {
      code: 'EEE',
      fullName: 'Electrical & Electronics Engineering',
      tagline: 'Powering industries with sustainable electrical solutions.',
      color: '#F59E0B',
      bgImage: 'https://source.unsplash.com/featured/800x600/?electrical,power,energy',
    },
    {
      code: 'MECH',
      fullName: 'Mechanical Engineering',
      tagline: 'Designing the machines that move the modern world.',
      color: '#6366F1',
      bgImage: 'https://source.unsplash.com/featured/800x600/?mechanical,gears,engineering',
    },
    {
      code: 'CIVIL',
      fullName: 'Civil Engineering',
      tagline: 'Shaping skylines and building the infrastructure of tomorrow.',
      color: '#0D9488',
      bgImage: 'https://source.unsplash.com/featured/800x600/?architecture,construction,bridge',
    },
    {
      code: 'IT',
      fullName: 'Information Technology',
      tagline: 'Transforming data into decisions through smart IT systems.',
      color: '#DB2777',
      bgImage: 'https://source.unsplash.com/featured/800x600/?server,network,data,technology',
    },
  ]);

  useEffect(() => {
    fetchUpcomingEvents();
    fetchLatestBlogs();
    fetchGalleryPreview();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.get('/events', { params: { status: 'upcoming' } });
      if (response.data.success) {
        // Sort by date ascending (nearest first)
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setUpcomingEvents(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchLatestBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      if (response.data.success) {
        // Sort by publishedAt descending (newest first), keep max 6
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setLatestBlogs(sorted.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchGalleryPreview = async () => {
    try {
      const response = await api.get('/gallery');
      if (response.data.success) {
        // Sort albums by createdAt descending
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // Store top 3 albums
        setGalleryPreview(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
  };



  return (
    <PageTransition className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative z-10 w-full">
      {/* ══════════════════════════════════════ */}
      {/* Hero Section                           */}
      {/* ══════════════════════════════════════ */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="relative min-h-screen flex items-center justify-center snap-start snap-always pt-16 overflow-hidden"
      >
        {/* Interactive floating blur orbs */}
        <motion.div
          animate={{ x: mousePos.x * 0.1, y: mousePos.y * 0.1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="absolute w-72 h-72 rounded-full bg-blue-300/10 blur-3xl -top-20 left-10 pointer-events-none -z-10"
        />
        <motion.div
          animate={{ x: -mousePos.x * 0.08, y: -mousePos.y * 0.08 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="absolute w-80 h-80 rounded-full bg-purple-300/10 blur-3xl bottom-10 right-10 pointer-events-none -z-10"
        />

        <div className="section-container relative z-10 py-8 flex flex-col items-center text-center max-w-4xl mx-auto px-6">

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EEF1F5] rounded-full text-iste-blue text-xs font-black mb-6 shadow-clay-sm select-none"
          >
            <span className="w-2 h-2 bg-iste-blue rounded-full animate-pulse" />
            ISTE Student Chapter, GMRIT
          </motion.div>

          <div className="relative px-8 select-none">
            {/* Interactive floating tech sparkles/nodes in the background */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              whileHover={{ scale: 1.3, rotate: 45 }}
              className="absolute -top-10 left-0 text-amber-500/40 text-3xl cursor-pointer select-none filter drop-shadow hidden md:block"
              title="Innovation"
            >
              ✦
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0], rotate: -15 }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              whileHover={{ scale: 1.3, rotate: 15 }}
              className="absolute top-2 -right-8 text-iste-blue/30 text-3xl font-mono cursor-pointer select-none font-black hidden md:block"
              title="Code"
            >
              &lt;/&gt;
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0], rotate: 45 }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              whileHover={{ scale: 1.3, rotate: 90 }}
              className="absolute bottom-10 -left-12 text-[#DB2777]/30 text-3xl font-extrabold cursor-pointer select-none hidden md:block"
              title="Connect"
            >
              +
            </motion.div>
            <motion.div
              animate={{ y: [0, 6, 0], rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              whileHover={{ scale: 1.3 }}
              className="absolute bottom-0 -right-10 text-slate-400/30 text-3xl cursor-pointer select-none hidden md:block"
              title="System"
            >
              ⚙
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-850 mb-6 tracking-tight max-w-4xl leading-[1.2] select-none mx-auto"
            >
              Empowering{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500 hover:brightness-110 transition-all duration-300 inline-block">
                Technical Excellence
              </span>{' '}
              Through Innovation
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-slate-500 font-bold leading-relaxed mb-10 max-w-2xl select-none"
          >
            The Indian Society for Technical Education (ISTE) Student Chapter at GMRIT is a platform for engineers to connect, build, and lead. We spark curiosity and accelerate growth across all engineering disciplines.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-4 select-none w-full"
          >
            <Link 
              to="/events" 
              className="px-6 py-3.5 rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md hover:scale-102 active:shadow-clay-pressed transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>View Events</span>
            </Link>

            <Link 
              to="/coordinators" 
              className="px-6 py-3.5 rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-slate-650 shadow-clay-sm hover:shadow-clay-md hover:scale-102 active:shadow-clay-pressed transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Meet the Team</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* About ISTE + Stats                     */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center py-20 lg:py-28 snap-start snap-always bg-transparent">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="section-heading text-slate-800 mb-4 select-none">
              About <span className="gradient-text">ISTE</span>
            </h2>
            <p className="text-slate-600 font-bold leading-relaxed select-none" >
              The Indian Society for Technical Education (ISTE) is a national professional
              non-profit making society registered under the Societies Registration Act of 1860.
              Our GMRIT Student Chapter is dedicated to conducting workshops, seminars, competitions,
              and cultural events that enhance technical skills and promote all-round development
              of engineering students.
            </p>
          </div>

          <BentoGrid className="gap-6 justify-center">
            {[
              { value: '6', label: 'Active Branches', size: 'bento-square' },
              { value: '50+', label: 'Coordinators', size: 'bento-square' },
              { value: '30+', label: 'Events/Year', size: 'bento-square' },
              { value: '1000+', label: 'Students Impacted', size: 'bento-square' },
            ].map((stat) => (
              <ClayCard
                key={stat.label}
                variant="raised"
                className={`p-6 flex flex-col items-center justify-center text-center group ${stat.size}`}
              >
                <div className="w-full max-w-[160px] mx-auto px-4 py-2.5 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset mb-4 text-2xl lg:text-3xl font-black font-jetbrains text-iste-blue select-none whitespace-nowrap">
                  <CountUp value={stat.value} />
                </div>
                <div className="text-xs text-slate-500 font-black tracking-wider uppercase select-none">{stat.label}</div>
              </ClayCard>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* Branch Cards                           */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-start pt-28 md:pt-32 pb-10 relative snap-start snap-always">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 rounded-full bg-[#EEF1F5] text-iste-blue text-xs sm:text-sm font-black shadow-clay-sm mb-2.5">
              Our Branches
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 mb-2 select-none">
              Six Branches. <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">One Vision.</span>
            </h2>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed select-none">
              Each branch has its own dedicated ISTE team driving technical excellence,
              events, and innovation across GMRIT.
            </p>
          </div>

          {/* Staggered branch card grid - BentoGrid + BranchCard */}
          <BentoGrid className="gap-4 sm:gap-6 max-w-6xl mx-auto">
            {branches.map((branch, index) => {
              const bentoClass = 'col-span-6 sm:col-span-4';
              return (
                <motion.div
                  key={branch.code}
                  className={bentoClass}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BranchCard
                    branch={branch}
                    isLarge={false}
                    onNavigate={() => navigate(`/coordinators?branch=${branch.code}`)}
                  />
                </motion.div>
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* Upcoming Events — Horizontal Scroll   */}
      {/* ══════════════════════════════════════ */}
      <UpcomingEventsSection
        events={upcomingEvents}
        loading={loadingEvents}
      />

      {/* ══════════════════════════════════════ */}
      {/* Latest Blog Posts                      */}
      {/* ══════════════════════════════════════ */}
      <LatestBlogSection
        posts={latestBlogs}
        loading={loadingBlogs}
      />

      <GalleryHighlightsSection
        albums={galleryPreview}
        loading={loadingGallery}
      />

      {/* ══════════════════════════════════════ */}
      {/* CTA Section                            */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center py-20 lg:py-28 snap-start snap-always">
        <div className="section-container">
          <ClayCard
            variant="raised"
            size="lg"
            className="relative p-10 lg:p-16 text-center bg-gradient-to-br from-[#A8C5F0] to-[#C9B8F0] shadow-clay-lg"
          >
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-4 select-none">
                Stay Connected with ISTE GMRIT
              </h2>
              <p className="text-slate-700 font-bold text-lg mb-8 max-w-xl mx-auto select-none">
                Follow our events, read our blog, and explore the gallery to see what our chapter is all about.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#EEF1F5] text-iste-blue font-extrabold rounded-full shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                  id="cta-blog"
                >
                  Read the Blog
                </Link>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#EEF1F5] text-iste-violet font-extrabold rounded-full shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                  id="cta-gallery"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </ClayCard>
        </div>
      </section>

      {/* Snap Footer */}
      <div className="snap-start snap-always">
        <Footer forceRender={true} />
      </div>
    </PageTransition>
  );
};

export default Home;
