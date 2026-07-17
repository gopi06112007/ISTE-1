import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeImage from './SafeImage';

const getInitials = (name = '?') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const CoordinatorCard = ({ profile, index = 0 }) => {
  const user = profile.userId || {};
  const isStudent = user.role === 'student_coordinator';

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
  const description = profile.bio || '';
  const socials = profile.socialLinks || {};

  const hasSocials = socials.linkedin || socials.github || socials.instagram;

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
      {/* ─── Photo wrapper ─── */}
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

      {/* ─── Badges — anchored to card corners, NOT photo ─── */}
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

      {/* ─── Content section ─── */}
      <div className="coord-content" style={{ padding: '14px 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Name */}
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#111111',
            lineHeight: 1.2,
            marginBottom: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {profile.name}
        </h3>

        {/* Role subtitle */}
        {profile.role && (
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#1D4ED8',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '8px',
            }}
          >
            {profile.role}
          </p>
        )}



        {/* Stats row */}
        <div className="flex items-center gap-3 mt-1 mb-3">
          {/* Student ID */}
          {isStudent && studentId && (
            <span className="flex items-center gap-[5px]" style={{ fontSize: '13px', color: '#6B7280' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="16" y1="9" x2="20" y2="9" />
                <line x1="16" y1="13" x2="20" y2="13" />
                <circle cx="8" cy="12" r="3" />
                <path d="M4 19c0-2 2-3.5 4-3.5s4 1.5 4 3.5" />
              </svg>
              {studentId}
            </span>
          )}

          {/* Faculty email */}
          {!isStudent && user.email && (
            <span className="flex items-center gap-[5px] truncate" style={{ fontSize: '13px', color: '#6B7280' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {user.email}
            </span>
          )}

          {/* Year */}
          {isStudent && year && (
            <span className="flex items-center gap-[5px]" style={{ fontSize: '13px', color: '#6B7280' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              {year}
            </span>
          )}

          {/* Faculty designation */}
          {!isStudent && profile.designation && (
            <span className="flex items-center gap-[5px] truncate" style={{ fontSize: '13px', color: '#6B7280' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.designation}
            </span>
          )}
        </div>

        {/* Social icons — brand colored */}
        {hasSocials && (
          <div className="flex items-center justify-center gap-2 mt-1">
            {socials.linkedin && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(socials.linkedin, '_blank', 'noopener,noreferrer'); }}
                className="coord-social-btn coord-social-linkedin flex items-center justify-center rounded-full cursor-pointer"
                aria-label={`${profile.name} LinkedIn`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
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
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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
