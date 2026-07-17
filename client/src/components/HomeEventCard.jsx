import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { EventDetailsModal } from './EventCard';

const branchGradients = {
  CSE:     'linear-gradient(135deg, #1A56DB, #60A5FA)',
  ECE:     'linear-gradient(135deg, #7C3AED, #A78BFA)',
  EEE:     'linear-gradient(135deg, #D97706, #FBBF24)',
  MECH:    'linear-gradient(135deg, #475569, #94A3B8)',
  CIVIL:   'linear-gradient(135deg, #0D9488, #5EEAD4)',
  IT:      'linear-gradient(135deg, #DB2777, #F472B6)',
  CENTRAL: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
};

const categoryBadgeStyles = {
  Workshop:    'text-purple-600 bg-purple-50/50 border border-purple-100',
  Seminar:     'text-blue-600 bg-blue-50/50 border border-blue-100',
  Competition: 'text-amber-600 bg-amber-50/50 border border-amber-100',
  Cultural:    'text-pink-600 bg-pink-50/50 border border-pink-100',
  Other:       'text-slate-650 bg-slate-50/50 border border-slate-100',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const HomeEventCard = ({ event, index = 0 }) => {
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

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={cardVariants}
        onClick={() => setIsModalOpen(true)}
        className="event-card-container flex flex-col h-full cursor-pointer"
      >
        {/* ── Poster Image Area ── */}
        <div className="relative w-full overflow-hidden rounded-t-[20px] rounded-b-none flex-shrink-0 h-[170px] md:h-[130px]"
          style={{ background: gradient }}
        >
          {/* Radial Glow Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none z-10" />

          {/* Calendar outline watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <svg className="w-16 h-16 text-white/15 stroke-current stroke-1" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
          </div>

          {!showFallback && (
            <img
              src={event.posterUrl}
              alt={`${event.title} poster`}
              className="w-full h-full object-cover object-center top-banner-img relative z-0"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}

          {/* Status Badge: pill-shaped, white/frosted background, small green dot indicator */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/75 backdrop-blur-md border border-white/30 text-emerald-600 shadow-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Upcoming
            </span>
          </div>
        </div>

        {/* ── Card Content ── */}
        <div className="flex flex-col flex-1 p-6">
          {/* Top badges row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
              {event.category || 'Other'}
            </span>
            <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200/50 uppercase tracking-wide">
              {branch}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-800 line-clamp-2 mb-1.5 leading-snug">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Date / Time / Venue rows */}
          <div className="space-y-2 text-[11px] sm:text-xs text-slate-500 mb-5">
            {event.date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
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
            className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-[#1A56DB]/5 text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-all duration-300 group/btn"
          >
            <span>View Details</span>
            <svg className="w-4 h-4 cta-btn-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>

      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        isUpcoming={event.status === 'upcoming'}
        formatDate={formatDate}
        categoryChipColors={categoryBadgeStyles}
        categoryIcons={{
          Workshop: '📅 ',
          Seminar: '🎤 ',
          Competition: '🏆 ',
          Cultural: '🎨 ',
          Other: '📌 ',
        }}
        getGoogleCalendarUrl={getGoogleCalendarUrl}
        handleShare={handleShare}
      />
    </>
  );
};

export default HomeEventCard;
