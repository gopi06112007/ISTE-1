import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const branchGradients = {
  CSE:     'linear-gradient(135deg, #1A56DB, #60A5FA)',
  ECE:     'linear-gradient(135deg, #7C3AED, #A78BFA)',
  EEE:     'linear-gradient(135deg, #D97706, #FBBF24)',
  MECH:    'linear-gradient(135deg, #475569, #94A3B8)',
  CIVIL:   'linear-gradient(135deg, #0D9488, #5EEAD4)',
  IT:      'linear-gradient(135deg, #DB2777, #F472B6)',
  CENTRAL: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
};

const EventCard = ({ event, compact = false, featured = false, index = 0 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUpcoming = event.status === 'upcoming';

  const categoryChipColors = {
    Workshop: 'text-purple-650 bg-purple-50/50 border border-purple-100',
    Seminar: 'text-blue-650 bg-blue-50/50 border border-blue-100',
    Competition: 'text-amber-650 bg-amber-50/50 border border-amber-100',
    Cultural: 'text-pink-650 bg-pink-50/50 border border-pink-100',
    Other: 'text-slate-650 bg-slate-50/50 border border-slate-100',
  };

  const categoryIcons = {
    Workshop: '📅 ',
    Seminar: '🎤 ',
    Competition: '🏆 ',
    Cultural: '🎨 ',
    Other: '📌 ',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Derive date parts for the card
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('en', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  // Close modal on Escape key press
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

  // Google Calendar Integration helper
  const getGoogleCalendarUrl = (ev) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const title = encodeURIComponent(ev.title);
    const d = new Date(ev.date);
    const dateStr = d.toISOString().replace(/-|:|\\.\\d\\d\\d/g, '');
    const details = encodeURIComponent(ev.description || '');
    const location = encodeURIComponent(ev.venue || '');
    return `${base}&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(`${window.location.origin}/events?id=${event._id}`)
      .then(() => toast.success('Event link copied'))
      .catch(() => toast.error('Could not copy event link'));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (idx) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: idx * 0.08,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  // ── COMPACT CARD (used in dashboard/sidebar views) ──────────────
  if (compact) {
    return (
      <>
        <motion.div
          custom={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          onClick={() => setIsModalOpen(true)}
          className="event-card-container p-4 flex items-center gap-4 cursor-pointer"
        >
          {/* Date badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-50 border border-slate-200/50 flex flex-col items-center justify-center text-slate-800">
            <span className="text-lg font-bold leading-none text-iste-blue">
              {day}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-550">
              {month}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryChipColors[event.category] || categoryChipColors.Other}`}>
                {event.category}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">{event.branch}</span>
            </div>
          </div>

          <svg className="w-4 h-4 text-gray-450 cta-btn-chevron flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>

        <EventDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={event}
          isUpcoming={isUpcoming}
          formatDate={formatDate}
          categoryChipColors={categoryChipColors}
          categoryIcons={categoryIcons}
          getGoogleCalendarUrl={getGoogleCalendarUrl}
          handleShare={handleShare}
        />
      </>
    );
  }

  // ── POSTER CARD (new design) ─────────────────────────────────────
  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={cardVariants}
        onClick={() => setIsModalOpen(true)}
        className="w-[300px] flex flex-col rounded-[28px] bg-white px-3 pb-5 pt-3 cursor-pointer flex-shrink-0
                   hover:scale-[1.02] transition-transform duration-300 ease-out"
        style={{
          boxShadow: '0 4px 10px rgba(0,0,0,0.05), 0 16px 32px rgba(0,0,0,0.10)',
        }}
      >
        {/* ── POSTER IMAGE — A4 portrait ratio ── */}
        <div
          className="w-full overflow-hidden rounded-[20px] mb-[18px]"
          style={{ aspectRatio: '1 / 1.4142' }}
        >
          {event.posterUrl ? (
            <SafeImage
              src={event.posterUrl}
              alt={`${event.title} poster`}
              className="w-full h-full object-cover object-center"
              fallbackType="event"
              objectPosition="center center"
            />
          ) : (
            /* Gradient fallback with watermark icon when no poster */
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-4"
              style={{ background: branchGradients[event.branch] || branchGradients.CENTRAL }}
            >
              <svg className="w-16 h-16 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-white/60 text-sm font-bold tracking-wide">No Poster</p>
            </div>
          )}
        </div>

        {/* ── CONTENT BLOCK — date column + text column ── */}
        <div className="flex gap-3 px-1">

          {/* DATE COLUMN */}
          <div className="flex flex-col items-start flex-shrink-0" style={{ width: '52px' }}>
            <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: '#166534' }}>
              {month}
            </span>
            <span className="text-[30px] font-extrabold leading-none" style={{ color: '#166534' }}>
              {day}
            </span>
          </div>

          {/* VERTICAL DIVIDER */}
          <div style={{ width: '1px', background: '#E5E7EB', alignSelf: 'stretch' }} />

          {/* TEXT COLUMN */}
          <div className="flex flex-col gap-1" style={{ flex: 1 }}>

            {/* LOCATION ROW */}
            <div className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[13px]" style={{ color: '#6B7280' }}>
                {event.venue || event.branch || 'ISTE GMRIT'}
              </span>
            </div>

            {/* TITLE */}
            <h3
              className="text-[20px] font-extrabold leading-tight"
              style={{ color: '#111111' }}
            >
              {event.title}
            </h3>

            {/* DESCRIPTION — 2 line clamp */}
            {event.description && (
              <p
                className="text-[13px] leading-snug mt-1"
                style={{
                  color: '#6B7280',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {event.description}
              </p>
            )}

            {/* PRICE / DATE TAG */}
            <div className="flex items-center gap-1 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span className="text-[12px]" style={{ color: '#9CA3AF' }}>
                {formatDate(event.date)}
              </span>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        isUpcoming={isUpcoming}
        formatDate={formatDate}
        categoryChipColors={categoryChipColors}
        categoryIcons={categoryIcons}
        getGoogleCalendarUrl={getGoogleCalendarUrl}
        handleShare={handleShare}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   Premium Event Details Modal Component (unchanged)
   ───────────────────────────────────────────────────────────── */
export const EventDetailsModal = ({
  isOpen,
  onClose,
  event,
  isUpcoming,
  formatDate,
  categoryChipColors,
  categoryIcons,
  getGoogleCalendarUrl,
  handleShare
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-3xl bg-[#EEF1F5] rounded-[20px] shadow-[0_16px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden max-h-[90vh] z-[130] p-2"
          >
            {/* Header image area */}
            <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-[16px] bg-[#EEF1F5] shadow-clay-inset p-3 flex-shrink-0">
              <div className="w-full h-full rounded-[12px] overflow-hidden shadow-clay-inset">
                <SafeImage
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  fallbackType="event"
                  eager
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Category overlay */}
              <div className="absolute bottom-6 left-6 flex gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-full ${categoryChipColors[event.category] || categoryChipColors.Other}`}>
                  {categoryIcons[event.category] || ''}{event.category}
                </span>
                <span className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#EEF1F5] text-slate-800 shadow-clay-sm">
                  {event.branch} Branch
                </span>
              </div>
            </div>

            {/* Scrollable details area */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Details Panel (2/3 width on desktop) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-clay-sm shadow-clay-sm bg-[#EEF1F5] mb-2 ${
                    isUpcoming ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    {isUpcoming ? '🟢 Upcoming Event' : 'Past Event'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                    {event.title}
                  </h2>
                </div>

                <div className="pt-3 border-t border-slate-200/40">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Event</h4>
                  <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line font-medium text-justify">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Right Sidebar Metadata Panel (1/3 width on desktop) */}
              <div className="space-y-4 md:border-l md:border-slate-200/40 md:pl-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Details</h4>
                
                <div className="space-y-3.5 text-sm text-slate-700 font-bold">
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0">📅</span>
                    <div>
                      <p className="font-extrabold text-slate-900">Date</p>
                      <p className="text-xs text-slate-500 font-bold">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  {event.time && (
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">🕐</span>
                      <div>
                        <p className="font-extrabold text-slate-900">Time</p>
                        <p className="text-xs text-slate-500 font-bold">{event.time}</p>
                      </div>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <div>
                        <p className="font-extrabold text-slate-900">Venue</p>
                        <p className="text-xs text-slate-500 font-bold">{event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Actions */}
                <div className="pt-4 border-t border-slate-200/40 space-y-2">
                  {isUpcoming ? (
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-clay-sm bg-[#EEF1F5] text-iste-blue text-xs font-bold shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
                    >
                      <span>📅 Add to Calendar</span>
                    </a>
                  ) : (
                    <div className="text-center p-3 rounded-clay-sm bg-[#EEF1F5] text-slate-500 text-xs font-bold shadow-clay-inset">
                      This event has concluded.
                    </div>
                  )}

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-clay-sm bg-[#EEF1F5] text-slate-700 text-xs font-bold shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
                  >
                    <span>🔗 Share Event</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EventCard;
