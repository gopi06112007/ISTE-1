import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const EventCard = ({ event, compact = false, featured = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUpcoming = event.status === 'upcoming';

  const categoryChipColors = {
    Workshop: 'text-purple-600 bg-[#EEF1F5] shadow-clay-inset',
    Seminar: 'text-blue-600 bg-[#EEF1F5] shadow-clay-inset',
    Competition: 'text-amber-600 bg-[#EEF1F5] shadow-clay-inset',
    Cultural: 'text-pink-600 bg-[#EEF1F5] shadow-clay-inset',
    Other: 'text-slate-600 bg-[#EEF1F5] shadow-clay-inset',
  };

  const categoryIcons = {
    Workshop: '📅 ',
    Seminar: '🎤 ',
    Competition: '🏆',
    Cultural: '🎨',
    Other: '📌',
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
    navigator.clipboard.writeText(`${window.location.origin}/events?id=${event._id}`);
    alert('Event link copied to clipboard!');
  };

  if (compact) {
    return (
      <>
        <ClayCard
          onClick={() => setIsModalOpen(true)}
          interactive={true}
          className="p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Date badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-clay-sm bg-[#EEF1F5] flex flex-col items-center justify-center text-slate-800 shadow-clay-inset">
            <span className="text-lg font-extrabold leading-none text-iste-blue">
              {new Date(event.date).getDate()}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500">
              {new Date(event.date).toLocaleString('en', { month: 'short' })}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryChipColors[event.category] || categoryChipColors.Other}`}>
                {event.category}
              </span>
              <span className="text-xs font-bold text-gray-500">{event.branch}</span>
            </div>
          </div>

          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </ClayCard>

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
      <ClayCard
        onClick={() => setIsModalOpen(true)}
        interactive={true}
        className={`overflow-hidden flex cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full p-3 ${
          featured ? 'flex-col md:flex-row gap-4 md:gap-6' : 'flex-col'
        }`}
      >
        {/* Poster */}
        <div className={`relative overflow-hidden rounded-clay-md bg-[#EEF1F5] shadow-clay-inset flex-shrink-0 ${
          featured ? 'w-full md:w-[45%] aspect-[4/3]' : 'w-full aspect-[4/3]'
        }`}>
          <SafeImage
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="w-full h-full object-cover"
            fallbackType="event"
            objectPosition="center center"
          />

          {/* Date badge on top of poster */}
          <div className="absolute bottom-3 left-3 flex-shrink-0 w-12 h-12 rounded-clay-sm bg-[#EEF1F5] flex flex-col items-center justify-center text-slate-800 shadow-clay-inset z-10">
            <span className="text-base font-extrabold leading-none text-iste-blue">
              {new Date(event.date).getDate()}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500">
              {new Date(event.date).toLocaleString('en', { month: 'short' })}
            </span>
          </div>

          {/* Status pill – top-left clay badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-clay-sm bg-[#EEF1F5] shadow-clay-sm ${
              isUpcoming ? 'text-emerald-600' : 'text-slate-600'
            }`}>
              {isUpcoming ? '🟢 Upcoming' : 'Past'}
            </span>
          </div>

          {/* Branch chip – top-right clay badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded-clay-sm bg-[#EEF1F5] text-slate-800 shadow-clay-sm">
              {event.branch}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`flex flex-col flex-grow ${featured ? 'pt-2 md:pt-4 md:justify-center' : 'pt-5'}`}>
          {/* Category chip */}
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-3 w-fit ${categoryChipColors[event.category] || categoryChipColors.Other}`}>
            {categoryIcons[event.category]} {event.category}
          </span>

          {/* Title */}
          <h3 className="text-base font-extrabold text-gray-900 mb-2 line-clamp-2 group-hover:text-iste-blue transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className={`text-sm text-gray-600 mb-4 leading-relaxed flex-1 font-medium text-justify ${featured ? 'line-clamp-4' : 'line-clamp-2'}`}>
            {event.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 mt-auto pt-3 border-t border-slate-200/40 font-bold">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>

            {event.time && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[120px]">{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </ClayCard>

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
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop (no blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-3xl bg-[#EEF1F5] rounded-clay-lg shadow-clay-lg flex flex-col overflow-hidden max-h-[90vh] z-[130] p-2"
          >
            {/* Header image area */}
            <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-clay-md bg-[#EEF1F5] shadow-clay-inset p-3 flex-shrink-0">
              <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset">
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
                  {categoryIcons[event.category]} {event.category}
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
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium text-justify">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Right Sidebar Metadata Panel (1/3 width on desktop) */}
              <div className="space-y-4 md:border-l md:border-slate-200/40 md:pl-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-bold">Details</h4>
                
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
