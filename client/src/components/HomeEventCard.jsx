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

const categoryChipStyles = {
  Workshop:    { bg: '#F3E8FD', color: '#7E22CE' },
  Seminar:     { bg: '#DBEAFE', color: '#1E40AF' },
  Competition: { bg: '#FEF3C7', color: '#92400E' },
  Cultural:    { bg: '#FCE7F3', color: '#9D174D' },
  Other:       { bg: '#F1F5F9', color: '#475569' },
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
  const chip = categoryChipStyles[event.category] || categoryChipStyles.Other;
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

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={cardVariants}
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col h-full cursor-pointer"
        style={{
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.03), 0 12px 36px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          transition: 'box-shadow 300ms ease, transform 300ms ease',
        }}
        whileHover={{
          y: -4,
          boxShadow: '0 8px 16px rgba(0,0,0,0.06), 0 20px 48px rgba(0,0,0,0.14)',
        }}
      >
        {/* ── Poster Image Area — padded + heavily rounded ── */}
        <div style={{ padding: '14px 14px 0 14px', flexShrink: 0 }}>
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: '20px',
              height: '225px',
              background: gradient,
            }}
          >
            {/* Radial Glow Overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none z-10" />

            {/* Calendar watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <svg className="w-20 h-20 text-white/10 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>

            {!showFallback && (
              <img
                src={event.posterUrl}
                alt={`${event.title} poster`}
                className="w-full h-full object-cover object-center relative z-0"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/80 backdrop-blur-md border border-white/30 text-emerald-600 shadow-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* ── Card Content ── */}
        <div className="flex flex-col flex-1" style={{ padding: '14px 16px 14px 16px' }}>

          {/* Top row: category chip + branch badge */}
          <div className="flex items-center justify-between gap-2" style={{ marginBottom: '10px' }}>
            <span
              className="text-[11px] font-bold rounded-full"
              style={{ background: chip.bg, color: chip.color, padding: '4px 12px', letterSpacing: '0.3px' }}
            >
              {event.category || 'Other'}
            </span>
            <span
              className="text-[10px] font-bold rounded-full uppercase tracking-wide"
              style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px' }}
            >
              {branch}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.25,
            marginBottom: '6px',
            letterSpacing: '-0.3px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p style={{
              fontSize: '12px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {event.description}
            </p>
          )}

          {/* Date / Time / Venue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
            {event.date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1A56DB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
            )}
            {event.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1A56DB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1A56DB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        isUpcoming={event.status === 'upcoming'}
        formatDate={formatDate}
        categoryChipColors={categoryChipStyles}
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
