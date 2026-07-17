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
    const dateStr = d.toISOString().replace(/-|:|\.\d\d\d/g, '');
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
              {new Date(event.date).getDate()}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-550">
              {new Date(event.date).toLocaleString('en', { month: 'short' })}
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

        {/* Modal rendering */}
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

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={cardVariants}
        onClick={() => setIsModalOpen(true)}
        className={`event-card-container flex cursor-pointer h-full ${
          featured ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
        {/* Top Banner (image/gradient area) */}
        <div className={`relative overflow-hidden rounded-t-[20px] rounded-b-none bg-gradient-to-br flex-shrink-0 ${
          featured ? 'w-full md:w-[45%] md:rounded-l-[20px] md:rounded-tr-none aspect-[4/3]' : 'w-full aspect-[4/3]'
        }`}
          style={{ background: branchGradients[event.branch] || branchGradients.CENTRAL }}
        >
          {/* Radial Glow Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none z-10" />

          {/* Calendar outline watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <svg className="w-16 h-16 text-white/15 stroke-current stroke-1" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
          </div>

          <SafeImage
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="w-full h-full object-cover top-banner-img relative z-0"
            fallbackType="event"
            objectPosition="center center"
          />

          {/* Status Badge: pill-shaped, white/frosted background, small green dot indicator */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-white/75 backdrop-blur-md border border-white/30 text-emerald-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
          </div>

          {/* Branch Badge: top-right */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-white/75 backdrop-blur-md border border-white/30 text-slate-700 shadow-sm uppercase tracking-wider">
              {event.branch}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex flex-col flex-grow p-6 ${featured ? 'md:justify-center' : ''}`}>
          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${categoryChipColors[event.category] || categoryChipColors.Other}`}>
              {categoryIcons[event.category]}{event.category}
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200/50 uppercase tracking-wide">
              {event.branch}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-[20px] font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">
            {event.description}
          </p>

          {/* Meta rows */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-auto pt-3 border-t border-slate-200/40">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>

            {event.time && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[120px]">{event.venue}</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="mt-4 pt-4 border-t border-[#EDEFF3]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-[#1A56DB]/5 text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-all duration-300 group/btn"
            >
              <span>View Details</span>
              <svg className="w-4 h-4 cta-btn-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal rendering */}
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
   Premium Event Details Modal Component
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
  if (!event) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Ambient Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl md:h-[82vh] max-h-[820px] bg-white rounded-[28px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 z-[130] my-auto"
          >
            {/* ── Left Side: Poster Studio View (Framed Box View) ── */}
            <div className="relative w-full md:w-[55%] h-[360px] sm:h-[450px] md:h-full bg-slate-950 flex flex-col p-4 md:p-6 overflow-hidden flex-shrink-0">
              {/* Ambient Blurred Background Poster Glow */}
              {event.posterUrl && (
                <img
                  src={event.posterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-125 pointer-events-none select-none"
                />
              )}

              {/* Subtly darkened overlay */}
              <div className="absolute inset-0 bg-slate-950/50 pointer-events-none z-0" />

              {/* Top Badges Header Bar (Cleanly separated above poster) */}
              <div className="relative z-20 flex items-center justify-between gap-2 mb-3 flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    ISTE Event
                  </span>
                  {event.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-md">
                      {categoryIcons[event.category] || ''} {event.category}
                    </span>
                  )}
                </div>

                {/* Mobile Close Button */}
                <button
                  onClick={onClose}
                  className="md:hidden p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-900 transition-all border border-white/10"
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Inner Frame Box for Poster Image (Fits completely inside) */}
              <div className="relative z-10 w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm p-2">
                <SafeImage
                  src={event.posterUrl}
                  alt={event.title}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                  fallbackType="full"
                  eager
                />
              </div>
            </div>

            {/* ── Right Side: Social Media Details Feed ── */}
            <div className="w-full md:w-[42%] flex flex-col h-full bg-white overflow-hidden">
              {/* Header: Organizer Info & Desktop Close */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                    ISTE
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">ISTE GMRIT</h4>
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Official Chapter Event • {event.branch || 'CENTRAL'}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="hidden md:flex p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body Feed: Scrollable Event Content */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                {/* Event Status & Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isUpcoming
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isUpcoming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isUpcoming ? 'Upcoming Event' : 'Past Event'}
                  </span>

                  {event.branch && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                      {event.branch}
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                  {event.title}
                </h2>

                {/* Event Highlights Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Date Card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                      <p className="text-xs font-bold text-slate-800">{formatDate(event.date) || 'TBA'}</p>
                    </div>
                  </div>

                  {/* Time Card */}
                  {event.time && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                        <p className="text-xs font-bold text-slate-800">{event.time}</p>
                      </div>
                    </div>
                  )}

                  {/* Venue Card */}
                  {event.venue && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue / Location</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* About Section */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Event</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {event.description || 'No detailed description available for this event.'}
                  </p>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
                {isUpcoming ? (
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Add to Calendar</span>
                  </a>
                ) : (
                  <div className="w-full sm:flex-1 text-center py-2.5 px-4 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                    Event Completed
                  </div>
                )}

                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
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
