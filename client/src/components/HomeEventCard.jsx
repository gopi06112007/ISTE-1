import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClayCard from './ui/ClayCard';
import { EventDetailsModal } from './EventCard';

const categoryChipColors = {
  Workshop: 'text-purple-600 bg-[#EEF1F5] shadow-clay-inset',
  Seminar: 'text-blue-600 bg-[#EEF1F5] shadow-clay-inset',
  Competition: 'text-amber-600 bg-[#EEF1F5] shadow-clay-inset',
  Cultural: 'text-pink-650 bg-[#EEF1F5] shadow-clay-inset',
  Other: 'text-slate-600 bg-[#EEF1F5] shadow-clay-inset',
};

const categoryIcons = {
  Workshop: '🔧',
  Seminar: '🎤',
  Competition: '🏆',
  Cultural: '🎭',
  Other: '📌',
};

/* ─────────────────────────────────────────────────────────────
   Branch gradient colors for poster fallbacks
   ──────────────────────────────────────────────────────────── */
const branchGradients = {
  CSE:     { from: '#1A56DB', to: '#60A5FA' },
  ECE:     { from: '#7C3AED', to: '#A78BFA' },
  EEE:     { from: '#D97706', to: '#FBBF24' },
  MECH:    { from: '#475569', to: '#94A3B8' },
  CIVIL:   { from: '#0D9488', to: '#5EEAD4' },
  IT:      { from: '#DB2777', to: '#F472B6' },
  CENTRAL: { from: '#1A56DB', to: '#7C3AED' },
};

/* ─────────────────────────────────────────────────────────────
   Category badge color mapping
   ──────────────────────────────────────────────────────────── */
const categoryBadgeStyles = {
  Workshop:    'text-blue-600 bg-[#EEF1F5] shadow-clay-inset',
  Seminar:     'text-purple-600 bg-[#EEF1F5] shadow-clay-inset',
  Competition: 'text-amber-600 bg-[#EEF1F5] shadow-clay-inset',
  Cultural:    'text-pink-600 bg-[#EEF1F5] shadow-clay-inset',
  Other:       'text-slate-600 bg-[#EEF1F5] shadow-clay-inset',
};

/* ─────────────────────────────────────────────────────────────
   Format date string to "18 Jul 2026"
   ──────────────────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ═════════════════════════════════════════════════════════════
   HomeEventCard — claymorphism event card for homepage carousel
   ═════════════════════════════════════════════════════════════ */
const HomeEventCard = ({ event }) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const branch = event.branch || 'CSE';
  const gradient = branchGradients[branch] || branchGradients.CSE;
  const badgeClass = categoryBadgeStyles[event.category] || categoryBadgeStyles.Other;
  const showFallback = !event.posterUrl || imgError;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const getGoogleCalendarUrl = (ev) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const title = encodeURIComponent(ev.title);
    const d = new Date(ev.date);
    const dateStr = d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const details = encodeURIComponent(ev.description || '');
    const location = encodeURIComponent(ev.venue || '');
    return `${base}&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/events?id=${event._id}`);
    alert('Event link copied to clipboard!');
  };

  return (
    <>
      <ClayCard
        variant="raised"
        onClick={() => setIsModalOpen(true)}
        className="group flex flex-col h-full overflow-hidden p-3.5 hover:-translate-y-1.5 duration-300 transition-all cursor-pointer"
      >
      {/* ── Poster Image Area ── */}
      <div className="relative w-full overflow-hidden rounded-clay-sm shadow-clay-inset flex-shrink-0 h-[170px] md:h-[130px]">
        {showFallback ? (
          /* Premium animated mesh gradient placeholder */
          <div
            className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          >
            {/* Background floating clay orbs */}
            <div className="absolute w-24 h-24 rounded-full bg-white/15 blur-lg -top-6 -left-6 animate-pulse" />
            <div className="absolute w-20 h-20 rounded-full bg-black/10 blur-md -bottom-4 -right-4" />
            <div className="absolute w-12 h-12 rounded-full bg-white/10 blur-sm top-1/2 left-1/4 animate-bounce" style={{ animationDuration: '4s' }} />

            <span className="text-white text-3xl md:text-4xl font-black tracking-widest drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] uppercase z-10">
              {branch}
            </span>
            {/* Calendar icon */}
            <svg className="w-7 h-7 text-white/70 mt-2.5 drop-shadow-sm z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          /* Actual poster image with scale zoom on hover */
          <img
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        {/* Status badge — top-left, overlaid on poster */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#EEF1F5] text-emerald-600 shadow-clay-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Upcoming
          </span>
        </div>
      </div>

      {/* ── Card Content ── */}
      <div className="flex flex-col flex-1 pt-3.5">
        {/* Top badges row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full ${badgeClass}`}>
            {event.category || 'Other'}
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-clay-sm bg-[#EEF1F5] text-slate-700 shadow-clay-sm uppercase">
            {branch}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-slate-850 line-clamp-2 mb-1.5 leading-snug group-hover:text-iste-blue transition-colors duration-200">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 md:line-clamp-1 mb-2.5 leading-relaxed font-bold text-justify">
            {event.description}
          </p>
        )}

        {/* Date / Time / Venue rows */}
        <div className="space-y-2 text-[11px] sm:text-xs text-slate-650 mb-5 font-extrabold">
          {event.date && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.time}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
        </div>

        {/* View Details button — pinned to bottom */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:bg-iste-blue hover:text-white hover:shadow-clay-md hover:scale-102 active:shadow-clay-pressed active:scale-98 transition-all duration-300 group/btn"
        >
          <span>View Details</span>
          <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </ClayCard>

    <EventDetailsModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      event={event}
      isUpcoming={event.status === 'upcoming'}
      formatDate={formatDate}
      categoryChipColors={categoryChipColors}
      categoryIcons={categoryIcons}
      getGoogleCalendarUrl={getGoogleCalendarUrl}
      handleShare={handleShare}
    />
  </>
);
};

export default HomeEventCard;
