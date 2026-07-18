import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeImage from './SafeImage';

const getInitials = (name = '?') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const CoordinatorCard = ({ profile, index = 0 }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const user = profile.userId || {};
  const isStudent = user.role === 'student_coordinator';
  const isFaculty = user.role === 'central_faculty' || user.role === 'branch_faculty';

  const roleLabels = {
    student_coordinator: 'Student',
    branch_faculty: 'Branch Faculty',
    central_faculty: 'Central Faculty',
  };

  const roleBadgeColors = {
    student_coordinator: { bg: '#DCFCE7', color: '#15803D' },
    branch_faculty: { bg: '#DBEAFE', color: '#1D4ED8' },
    central_faculty: { bg: '#FEF3C7', color: '#92400E' },
  };

  const badgeStyle = roleBadgeColors[user.role] || roleBadgeColors.branch_faculty;

  const fallbackGradients = {
    CSE: 'linear-gradient(135deg, #1A56DB, #60A5FA)',
    ECE: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    EEE: 'linear-gradient(135deg, #D97706, #FBBF24)',
    MECH: 'linear-gradient(135deg, #475569, #94A3B8)',
    CIVIL: 'linear-gradient(135deg, #0D9488, #5EEAD4)',
    IT: 'linear-gradient(135deg, #DB2777, #F472B6)',
    CENTRAL: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
  };
  const gradient = fallbackGradients[profile.branch?.toUpperCase()] || fallbackGradients.CENTRAL;

  const MotionLink = motion(Link);

  // Derive props from profile structure
  const studentId = user.jntuNo || '';
  const year = profile.year || '';
  const socials = profile.socialLinks || {};

  const hasSocials = socials.linkedin || socials.github || socials.instagram;

  // Mobile Tag list (Branch, Role type, Year, Designation)
  const tags = [
    profile.branch,
    roleLabels[user.role],
    year,
    profile.designation
  ].filter(Boolean);

  // Mobile Category Pill colors based on specific roles
  const categoryPillColors = (role = '') => {
    const normalized = role.toUpperCase();
    if (normalized.includes('SPEAKER')) {
      return { bg: '#FEF3C7', text: '#92400E' };
    }
    if (normalized.includes('DOCUMENTATION')) {
      return { bg: '#DBEAFE', text: '#1E40AF' };
    }
    if (normalized.includes('TECHNICAL SUPPORT') || normalized.includes('TECH')) {
      return { bg: '#DCFCE7', text: '#15803D' };
    }
    // Default is Student Coordinator / other roles
    return { bg: '#F3E8FD', text: '#7E22CE' };
  };
  const pillColor = categoryPillColors(profile.role || roleLabels[user.role] || '');

  // Render Mobile View Horizontal Card Layout (Viewport < 640px)
  if (isMobile) {
    return (
      <MotionLink
        to={`/coordinators/${profile._id}`}
        custom={index}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-[20px] bg-white p-4 flex flex-col gap-3 text-left"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 10px 24px rgba(0,0,0,0.08)' }}
      >
        {/* ROW 1 — CATEGORY PILL */}
        <span
          className="self-end rounded-full px-3 py-[5px] text-[12px] font-semibold"
          style={{ background: pillColor.bg, color: pillColor.text }}
        >
          {profile.role || roleLabels[user.role] || 'Student Coordinator'}
        </span>

        {/* ROW 2 — AVATAR + NAME/META */}
        <div className="flex items-center gap-3">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
              style={{ background: gradient }}
            >
              {getInitials(profile.name)}
            </div>
          )}

          <div className="flex flex-col gap-[3px] min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-bold text-[#111111] truncate">
                {profile.name}
              </span>
              {isFaculty && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E" className="flex-shrink-0" title="Official Faculty">
                  <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7 3.1 5.52l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.46 3.4 1.46 1.89-3.2 3.61-.82-.34-3.7L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-1 text-[13px]" style={{ color: '#6B7280' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="16" y1="9" x2="20" y2="9" />
                <line x1="16" y1="13" x2="20" y2="13" />
                <circle cx="8" cy="12" r="3" />
                <path d="M4 19c0-2 2-3.5 4-3.5s4 1.5 4 3.5" />
              </svg>
              <span>{studentId || user.email || 'Coordinator'} {year && `· ${year}`}</span>
            </div>
          </div>
        </div>

        {/* ROW 3 — TAG PILLS */}
        <div className="flex flex-wrap gap-[6px]">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-[12px] font-medium truncate"
              style={{ background: '#F3F4F6', color: '#374151', maxWidth: '120px' }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span
              className="rounded-full px-3 py-1 text-[12px] font-medium"
              style={{ background: '#F3F4F6', color: '#9CA3AF' }}
            >
              +{tags.length - 3}
            </span>
          )}
        </div>

        {/* ROW 3.5 — SOCIAL MEDIA BUTTONS */}
        {hasSocials && (
          <div className="flex items-center gap-2 mt-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 shadow-sm"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#24292F] hover:bg-[#24292F] hover:text-white transition-all duration-300 shadow-sm"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C] hover:text-white transition-all duration-300 shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            )}
          </div>
        )}

        {/* ROW 4 — ACTION BUTTONS */}
        <div className="flex items-center gap-2 mt-1">
          <button
            className="flex-1 rounded-full py-[10px] text-[13px] font-semibold text-[#111111]"
            style={{ background: 'transparent', border: '1.5px solid #E5E7EB' }}
          >
            View profile
          </button>
          {hasSocials && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (socials.linkedin) {
                  window.open(socials.linkedin, '_blank', 'noopener,noreferrer');
                } else if (socials.github) {
                  window.open(socials.github, '_blank', 'noopener,noreferrer');
                } else if (socials.instagram) {
                  window.open(socials.instagram, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex-1 flex items-center justify-center gap-1 rounded-full py-[10px] text-[13px] font-semibold text-white"
              style={{ background: '#111111' }}
            >
              Connect
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </button>
          )}
        </div>
      </MotionLink>
    );
  }

  // Render Desktop/Tablet View Card Layout (Viewport >= 640px)
  return (
    <MotionLink
      to={`/coordinators/${profile._id}`}
      custom={index}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="coord-card block"
    >
      {/* Photo wrapper */}
      <div className="coord-photo-wrapper">
        {profile.photoUrl ? (
          <SafeImage
            src={profile.photoUrl}
            alt={`${profile.name} - ISTE GMRIT`}
            fallbackType="profile"
            name={profile.name}
            className="coord-photo"
            objectPosition="center top"
          />
        ) : (
          <div className="coord-photo coord-fallback flex items-center justify-center" style={{ background: gradient }}>
            <span className="text-5xl font-black text-white/90 select-none drop-shadow">
              {getInitials(profile.name)}
            </span>
          </div>
        )}
      </div>

      {/* Badges — anchored to card corners, NOT photo */}
      {profile.branch && (
        <span
          className="absolute z-10 rounded-full coord-badge"
          style={{
            top: '18px',
            left: '18px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#111111',
            fontSize: '12px',
            fontWeight: 700,
            padding: '5px 12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            letterSpacing: '0.3px',
          }}
        >
          {profile.branch}
        </span>
      )}
      <span
        className="absolute z-10 rounded-full coord-badge"
        style={{
          top: '18px',
          right: '18px',
          background: badgeStyle.bg,
          color: badgeStyle.color,
          fontSize: '12px',
          fontWeight: 700,
          padding: '5px 12px',
          letterSpacing: '0.3px',
        }}
      >
        {roleLabels[user.role] || user.role}
      </span>

      {/* Content section */}
      <div className="coord-content" style={{ padding: '16px 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Role chip */}
        {profile.role && (
          <span style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            fontSize: '10px',
            fontWeight: 700,
            color: '#1D4ED8',
            background: '#EFF6FF',
            padding: '3px 10px',
            borderRadius: '9999px',
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            {profile.role}
          </span>
        )}

        {/* Name */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#0F172A',
          lineHeight: 1.25,
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.name}
          </span>
          {isFaculty && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E" style={{ flexShrink: 0 }} title="Official Faculty">
              <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7 3.1 5.52l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.46 3.4 1.46 1.89-3.2 3.61-.82-.34-3.7L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        </h3>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {isStudent && studentId && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="16" y1="9" x2="20" y2="9" /><line x1="16" y1="13" x2="20" y2="13" /><circle cx="8" cy="12" r="3" /><path d="M4 19c0-2 2-3.5 4-3.5s4 1.5 4 3.5" />
              </svg>
              {studentId}
            </span>
          )}
          {!isStudent && user.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', overflow: 'hidden', maxWidth: '180px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
            </span>
          )}
          {isStudent && year && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              {year}
            </span>
          )}
          {!isStudent && profile.designation && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', overflow: 'hidden', maxWidth: '160px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.designation}</span>
            </span>
          )}
        </div>

        {/* Social icons strip */}
        {hasSocials && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#F8FAFC',
            borderRadius: '14px',
            padding: '10px 0',
          }}>
            {socials.linkedin && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(socials.linkedin, '_blank', 'noopener,noreferrer'); }}
                className="coord-social-btn coord-social-linkedin flex items-center justify-center rounded-full cursor-pointer"
                aria-label={`${profile.name} LinkedIn`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </span>
            )}
            {socials.github && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(socials.github, '_blank', 'noopener,noreferrer'); }}
                className="coord-social-btn coord-social-github flex items-center justify-center rounded-full cursor-pointer"
                aria-label={`${profile.name} GitHub`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                </svg>
              </span>
            )}
            {socials.instagram && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(socials.instagram, '_blank', 'noopener,noreferrer'); }}
                className="coord-social-btn coord-social-instagram flex items-center justify-center rounded-full cursor-pointer"
                aria-label={`${profile.name} Instagram`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </MotionLink>
  );
};

export default CoordinatorCard;
