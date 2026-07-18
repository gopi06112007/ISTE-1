import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import HomeEventCard from '../HomeEventCard';
import HomeBlogCard from '../HomeBlogCard';
import ClayCard from '../ui/ClayCard';
import Lightbox from '../Lightbox';
import AlbumGrid from '../AlbumGrid';
import { HomeEventSkeleton, HomeBlogSkeleton, HomeGallerySkeleton } from '../ui/SkeletonLoaders';

const SectionErrorState = ({ title, message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-clay-sm flex items-center justify-center mb-5 bg-[#EEF1F5] shadow-clay-sm">
      <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-extrabold text-slate-800 mb-1">{title}</h3>
    <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-iste-blue/25 transition-all"
      >
        Try Again
      </button>
    )}
  </motion.div>
);

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
export const BranchCard = ({ branch, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ClayCard
      as="button"
      type="button"
      variant="raised"
      tint={branch.code}
      interactive={true}
      aria-label={`View ${branch.fullName} coordinators`}
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="flex flex-col h-full w-full items-center justify-center p-3.5 sm:p-4.5 text-center select-none min-h-[140px] sm:min-h-[150px] border-0 appearance-none focus:outline-none focus-visible:ring-4 focus-visible:ring-iste-blue/30"
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

export const UpcomingEventsSection = ({ events, loading, error, onRetry }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const autoPlayTimer = useRef(null);
  const wheelTimeout = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto-advance logic
  const resetTimer = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    if (!isPaused && events && events.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        handleNext();
      }, 4500);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isPaused, activeIdx, events]);

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  /* ── Custom Tactile Arrow Button ── */
  const ArrowBtn = ({ direction }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (direction === -1) handlePrev();
        else handleNext();
      }}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/70 hover:bg-white border border-white/60 shadow-clay-md hover:scale-110 active:scale-90 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
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
    <section className="min-h-screen flex flex-col justify-center pt-24 pb-32 md:pt-32 snap-start snap-always relative overflow-hidden">
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
          <HomeEventSkeleton />
        ) : error ? (
          <SectionErrorState
            title="Events could not load"
            message={error}
            onRetry={onRetry}
          />
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
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Check back soon - events are added regularly.</p>
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
          <div
            className="relative w-full h-[560px] flex items-center justify-center overflow-hidden group select-none"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1200 }}
          >
            {/* Left Arrow - Hidden on mobile, visible on desktop/hover */}
            {events.length > 1 && (
              <div className="absolute left-2 lg:left-6 z-40 hidden sm:flex">
                <ArrowBtn direction={-1} />
              </div>
            )}

            {/* Slider track */}
            <div className="relative flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              {events.map((event, index) => {
                let diff = index - activeIdx;
                const count = events.length;
                if (diff > Math.floor(count / 2)) diff -= count;
                if (diff < -Math.floor(count / 2)) diff += count;

                // Only render 5 cards (active, 2 left, 2 right)
                const isVisible = Math.abs(diff) <= 2;
                if (!isVisible) return null;

                const isMobile = windowWidth < 640;
                const offsetMultiplier = isMobile ? 160 : 230;

                const translateX = diff * offsetMultiplier;
                const rotateY = diff * -6;
                const translateZ = Math.abs(diff) * -100;
                const scale = diff === 0 ? 1 : 0.82;
                const opacity = diff === 0 ? 1 : diff === 1 || diff === -1 ? 0.55 : 0.2;
                const zIndex = diff === 0 ? 30 : diff === 1 || diff === -1 ? 20 : 10;
                const blurVal = diff === 0 ? '0px' : diff === 1 || diff === -1 ? '2px' : '4px';

                return (
                  <motion.div
                    key={event._id}
                    className="absolute w-[320px] sm:w-[360px] h-[505px] flex-shrink-0 cursor-pointer"
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
                      y: diff === 0 ? 0 : 10,
                      filter: `blur(${blurVal})`,
                    }}
                    drag={diff === 0 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                      const threshold = 50;
                      if (info.offset.x < -threshold) {
                        handleNext();
                      } else if (info.offset.x > threshold) {
                        handlePrev();
                      }
                    }}
                    transition={{
                      type: 'tween',
                      ease: [0.22, 1, 0.36, 1], // cubic-bezier(0.22, 1, 0.36, 1)
                      duration: 0.6,
                      opacity: { duration: 0.6, ease: 'easeInOut' },
                      filter: { duration: 0.6, ease: 'easeInOut' }
                    }}
                    onClick={() => {
                      if (diff !== 0) {
                        setActiveIdx(index);
                      }
                    }}
                  >
                    <div className={diff === 0 ? 'pointer-events-auto w-full h-full' : 'pointer-events-none w-full h-full'}>
                      <HomeEventCard event={event} index={index} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Arrow - Hidden on mobile, visible on desktop/hover */}
            {events.length > 1 && (
              <div className="absolute right-2 lg:right-6 z-40 hidden sm:flex">
                <ArrowBtn direction={1} />
              </div>
            )}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-[#1A56DB] text-sm font-semibold"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   LatestBlogSection — horizontal scroll carousel for blog posts
   ──────────────────────────────────────────────────────────── */

export const LatestBlogSection = ({ posts, loading, error, onRetry }) => {
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
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/70 hover:bg-white border border-white/60 shadow-clay-md hover:scale-110 active:scale-90 sm:opacity-0 sm:scale-90 group-hover:opacity-100 group-hover:scale-100"
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
    <section className="min-h-screen flex flex-col justify-center pt-24 pb-32 md:pt-32 snap-start snap-always relative overflow-hidden">
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
          <HomeBlogSkeleton />
        ) : error ? (
          <SectionErrorState
            title="Blog posts could not load"
            message={error}
            onRetry={onRetry}
          />
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
              className="hidden sm:flex relative w-full h-[420px] items-center justify-center overflow-hidden group"
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
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   LightboxModal — full-screen media viewer
   ──────────────────────────────────────────────────────────── */
const LightboxModal = ({ isOpen, currentAlbumPhotos, currentIndex, albumName, branch, onClose, onNext, onPrev }) => {
  return (
    <Lightbox
      photos={currentAlbumPhotos}
      currentIndex={currentIndex}
      albumName={albumName}
      branch={branch}
      isOpen={isOpen}
      onClose={onClose}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   GalleryHighlightsSection — masonry grid (desktop) / horizontal scroll (mobile)
   ──────────────────────────────────────────────────────────── */
export const GalleryHighlightsSection = ({ albums = [], loading, error, onRetry }) => {
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxAlbumName, setLightboxAlbumName] = useState('');
  const [lightboxBranch, setLightboxBranch] = useState('');

  const openLightbox = (album, index = 0) => {
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayAlbums = isMobile ? albums.slice(0, 3) : albums.slice(0, 6);

  return (
    <section className="min-h-screen flex flex-col justify-center pt-24 pb-32 md:pt-32 snap-start snap-always relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="block text-xs font-bold tracking-widest uppercase text-iste-blue mb-2">
              Gallery Highlights
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-black text-slate-800 leading-tight">
              Moments <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Captured</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-bold">Snapshots from events, workshops, and achievements across GMRIT</p>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300 text-sm font-extrabold group"
          >
            <span>View All Albums</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <HomeGallerySkeleton />
        ) : error ? (
          <SectionErrorState
            title="Gallery could not load"
            message={error}
            onRetry={onRetry}
          />
        ) : displayAlbums.length === 0 ? (
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
            <p className="text-slate-400 text-sm max-w-xs font-semibold">Gallery albums will appear here once events are photographed.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {displayAlbums.map((album) => (
                <div key={album._id} className="h-full">
                  <AlbumGrid
                    album={album}
                    onClick={() => openLightbox(album)}
                  />
                </div>
              ))}
            </motion.div>

            {/* Mobile CTA (Centered View All Button below cards) */}
            <div className="flex justify-center mt-8 sm:hidden">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1F5] text-iste-blue shadow-clay-sm active:shadow-clay-pressed active:scale-95 transition-all duration-300 text-sm font-extrabold group"
              >
                <span>View All Albums</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
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


export const CountUp = ({ value, duration = 1500 }) => {
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
