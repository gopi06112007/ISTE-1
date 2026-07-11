import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const getInitials = (name = '?') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CoordinatorCard = ({ profile }) => {
  const user = profile.userId || {};
  const isStudent = user.role === 'student_coordinator';

  // Soft colored badges with borders matching roles
  const roleBadgeStyles = {
    student_coordinator: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-clay-sm',
    branch_faculty: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-clay-sm',
    central_faculty: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-clay-sm',
  };

  const roleLabels = {
    student_coordinator: 'Student',
    branch_faculty: 'Branch Faculty',
    central_faculty: 'Central Faculty',
  };

  const badgeClass = roleBadgeStyles[user.role] || 'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-clay-sm';

  const branchAccents = {
    CSE: 'blue',
    ECE: 'violet',
    EEE: 'amber',
    MECH: 'slate',
    CIVIL: 'teal',
    IT: 'rose',
    CENTRAL: 'blue',
  };
  const accentColor = branchAccents[profile.branch?.toUpperCase()] || 'blue';

  const branchGradients = {
    CSE: 'from-blue-100/60 to-indigo-50/40',
    ECE: 'from-purple-100/60 to-pink-50/40',
    EEE: 'from-amber-100/60 to-yellow-50/40',
    MECH: 'from-slate-100/70 to-zinc-50/50',
    CIVIL: 'from-teal-100/60 to-emerald-50/40',
    IT: 'from-pink-100/60 to-rose-50/40',
    CENTRAL: 'from-blue-100/60 to-purple-50/40',
  };
  const gradientClass = branchGradients[profile.branch?.toUpperCase()] || branchGradients.CENTRAL;

  return (
    <ClayCard
      as={Link}
      to={`/coordinators/${profile._id}`}
      interactive={true}
      accent={accentColor}
      className="flex flex-col h-full items-stretch overflow-hidden p-4 group"
    >
      {/* Photo / Avatar Zone - Centered circular avatar with gradient border and branch bi-gradient */}
      <div className={`relative w-full aspect-square rounded-clay-md bg-gradient-to-br ${gradientClass} shadow-clay-inset flex items-center justify-center p-4 overflow-hidden flex-shrink-0 select-none`}>
        {/* Ambient background depth orbs */}
        <div className="absolute w-24 h-24 rounded-full bg-iste-blue/10 blur-xl -top-6 -left-6" />
        <div className="absolute w-20 h-20 rounded-full bg-iste-violet/10 blur-lg -bottom-4 -right-4" />

        <div className="relative p-1 rounded-full bg-gradient-to-tr from-iste-blue via-iste-violet to-iste-teal shadow-clay-md transition-all duration-500 ease-spring group-hover:scale-110 group-hover:rotate-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white bg-white shadow-clay-inset">
            {profile.photoUrl ? (
              <SafeImage
                src={profile.photoUrl}
                alt={`${profile.name} - ISTE GMRIT`}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                fallbackType="profile"
                name={profile.name}
                objectPosition="center top"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EBF2FC] to-[#F2EFFF] flex items-center justify-center">
                <span className="text-xl font-extrabold tracking-wider text-iste-blue select-none">
                  {getInitials(profile.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Branch badge — top-left overlaid on photo zone */}
        {profile.branch && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-2.5 py-1 text-xs font-bold rounded-clay-sm bg-[#EEF1F5]/85 text-slate-800 shadow-clay-sm backdrop-blur-sm">
              {profile.branch}
            </span>
          </div>
        )}

        {/* Role badge — top-right overlaid on photo zone */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full backdrop-blur-sm ${badgeClass}`}>
            {roleLabels[user.role] || user.role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-5 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="text-lg font-extrabold text-gray-900 mb-1 line-clamp-1 group-hover:text-iste-blue transition-colors duration-200">
          {profile.name}
        </h3>

        {/* Role/title */}
        {profile.role && (
          <p className="text-sm font-bold mb-3 line-clamp-1 text-iste-blue">
            {profile.role}
          </p>
        )}

        {/* Info rows */}
        <div className="space-y-2 text-sm mb-3 font-semibold">
          {isStudent && user.jntuNo && (
            <div className="flex items-center gap-2 text-gray-650 text-xs">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="font-mono text-xs">{user.jntuNo}</span>
            </div>
          )}

          {!isStudent && user.email && (
            <div className="flex items-center gap-2 text-gray-650 text-xs">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs truncate">{user.email}</span>
            </div>
          )}

          {isStudent && profile.year && (
            <div className="flex items-center gap-2 text-gray-650 text-xs">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>{profile.year}</span>
            </div>
          )}

          {!isStudent && profile.designation && (
            <div className="flex items-center gap-2 text-gray-650 text-xs">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{profile.designation}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-semibold">
            {profile.bio}
          </p>
        )}

        {/* Social Links Footer */}
        {profile.socialLinks && (
          <div className="flex items-center gap-2 pt-3 mt-auto border-t border-slate-200/50">
            {profile.socialLinks.linkedin && (
              <span
                onClick={(e) => { e.preventDefault(); window.open(profile.socialLinks.linkedin, '_blank', 'noopener,noreferrer'); }}
                className="w-8 h-8 rounded-full bg-[#EEF1F5] flex items-center justify-center text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-90 transition-all duration-300 cursor-pointer"
                aria-label={`${profile.name} LinkedIn`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </span>
            )}
            {profile.socialLinks.github && (
              <span
                onClick={(e) => { e.preventDefault(); window.open(profile.socialLinks.github, '_blank', 'noopener,noreferrer'); }}
                className="w-8 h-8 rounded-full bg-[#EEF1F5] flex items-center justify-center text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-90 transition-all duration-300 cursor-pointer"
                aria-label={`${profile.name} GitHub`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </span>
            )}
            {profile.socialLinks.instagram && (
              <span
                onClick={(e) => { e.preventDefault(); window.open(profile.socialLinks.instagram, '_blank', 'noopener,noreferrer'); }}
                className="w-8 h-8 rounded-full bg-[#EEF1F5] flex items-center justify-center text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-90 transition-all duration-300 cursor-pointer"
                aria-label={`${profile.name} Instagram`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </ClayCard>
  );
};

export default CoordinatorCard;
