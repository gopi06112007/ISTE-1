import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import PageTransition from '../components/ui/PageTransition';
import SafeImage from '../components/SafeImage';
import { buildCloudinaryUrl } from '../utils/cloudinary';

/* ─── Role helpers ───────────────────────────────────────── */
const roleLabels = {
  student_coordinator: 'Student Coordinator',
  branch_faculty: 'Branch Faculty',
  central_faculty: 'Central Faculty',
};

/* ─── Stagger animation variants ────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Skeleton loader ────────────────────────────────────── */
const SkeletonHero = () => (
  <div className="animate-pulse">
    {/* Card container */}
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden mb-8">
      {/* Banner skeleton */}
      <div className="h-36 sm:h-48 w-full bg-slate-100" />
      {/* Profile info skeleton */}
      <div className="px-6 sm:px-10 pb-8 relative flex flex-col items-start">
        {/* Avatar skeleton */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-200 border-4 border-white -mt-16 sm:-mt-20 z-10" />
        
        {/* Details skeleton */}
        <div className="w-full mt-4 space-y-3">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-5 bg-slate-200 rounded w-1/2 mt-2" />
        </div>
        

      </div>
    </div>
    
    {/* Details grid skeleton */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl shadow-sm" />
      ))}
    </div>
  </div>
);

/* ─── Detail card ───────────────────────────────────────── */
const DetailCard = ({ icon, label, value }) => (
  <motion.div 
    variants={item} 
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-md shadow-slate-100/20 flex items-center gap-4 hover:shadow-lg hover:border-slate-200/50"
  >
    <div className="p-3 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">{label}</span>
      <p className="text-slate-800 font-bold text-sm mt-0.5 font-display">{value || '—'}</p>
    </div>
  </motion.div>
);

/* ─── Mini coordinator card for "More from branch" ──────── */
const MiniCard = ({ profile }) => {
  const user = profile.userId || {};
  const isFaculty = user.role === 'central_faculty' || user.role === 'branch_faculty';

  return (
    <Link
      to={`/coordinators/${profile._id}`}
      className="w-[180px] min-w-[180px] max-w-[180px] flex-shrink-0 bg-white border border-slate-100/90 rounded-2xl p-3 shadow-md shadow-slate-100/20 hover:shadow-lg hover:border-slate-200/50 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-full aspect-square overflow-hidden bg-slate-50 rounded-xl p-1 flex-shrink-0 relative">
        <div className="absolute inset-0 p-0.5 rounded-xl bg-gradient-to-r from-[#FFDEB4] to-[#FFCAD4] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full rounded-[10px] bg-white"></div>
        </div>
        <div className="w-full h-full rounded-xl overflow-hidden bg-white relative z-10">
          <SafeImage
            src={buildCloudinaryUrl(profile.photoUrl, 'profile')}
            alt={`${profile.name} - ISTE GMRIT`}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            fallbackType="profile"
            name={profile.name}
            objectPosition="center top"
          />
        </div>
      </div>
      <div className="pt-3">
        <p className="text-sm font-bold text-slate-800 line-clamp-1 flex items-center gap-1 font-display group-hover:text-iste-blue transition-colors">
          <span className="truncate">{profile.name}</span>
          {isFaculty && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E" className="flex-shrink-0" title="Official Faculty">
              <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7 3.1 5.52l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.46 3.4 1.46 1.89-3.2 3.61-.82-.34-3.7L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-bold line-clamp-1 tracking-wider uppercase font-sans">{profile.role || roleLabels[user.role] || ''}</p>
      </div>
    </Link>
  );
};

/* ─── Main Page ─────────────────────────────────────────── */
const ProfileDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — ISTE GMRIT`;
    }
    return () => { document.title = 'ISTE GMRIT — Student Chapter'; };
  }, [profile]);

  useEffect(() => {
    if (!showMenu) return;
    const closeMenu = () => setShowMenu(false);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/profiles/${id}`);
      if (res.data.success) {
        const p = res.data.data;
        setProfile(p);
        // Fetch related profiles from same branch
        if (p.branch) {
          const relRes = await api.get('/profiles', { params: { branch: p.branch } });
          if (relRes.data.success) {
            setRelated(relRes.data.data.filter(r => r._id !== p._id));
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('not_found');
      } else {
        setError('network');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const user = profile?.userId || {};
  const isStudent = user.role === 'student_coordinator';
  const isFaculty = user.role === 'central_faculty' || user.role === 'branch_faculty';
  const isActive = user.isActive !== false;

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      toast.success('Email copied to clipboard!');
    } else {
      toast.error('No email configured for this profile.');
    }
    setShowMenu(false);
  };

  const handleCopyJNTU = () => {
    if (user?.jntuNo) {
      navigator.clipboard.writeText(user.jntuNo);
      toast.success('JNTU Number copied to clipboard!');
    }
    setShowMenu(false);
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard!');
    setShowMenu(false);
  };

  /* ── Back URL preserving filters ─── */
  const backUrl = location.state?.fromSearch
    ? `/coordinators${location.state.fromSearch}`
    : '/coordinators';

  /* ── Loading skeleton ─────────────── */
  if (loading) {
    return (
      <PageTransition className="pt-4 lg:pt-20 pb-16">
        <div className="section-container max-w-4xl px-4">
          <div className="mb-8 h-4 w-36 bg-gray-200 rounded animate-pulse" />
          <SkeletonHero />
        </div>
      </PageTransition>
    );
  }

  /* ── Error / 404 states ──────────── */
  if (error === 'not_found' || !profile) {
    return (
      <PageTransition className="pt-4 lg:pt-20 min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center shadow-xl">
          <p className="text-6xl mb-4 select-none">🔍</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 select-none font-display">Profile Not Found</h2>
          <p className="text-slate-500 font-medium text-sm mb-6 select-none">This coordinator's profile doesn't exist or was removed.</p>
          <Link
            to="/coordinators"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-[#1A56DB] text-white shadow-md hover:bg-[#1A56DB]/90 transition-all duration-300"
          >
            ← Back to Coordinators
          </Link>
        </div>
      </PageTransition>
    );
  }

  if (error === 'network') {
    return (
      <PageTransition className="pt-4 lg:pt-20 min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center shadow-xl">
          <p className="text-6xl mb-4 select-none">⚠️</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 select-none font-display">Connection Error</h2>
          <p className="text-slate-500 font-medium text-sm mb-6 select-none">Unable to load this profile. Please check your connection.</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-[#1A56DB] text-white shadow-md hover:bg-[#1A56DB]/90 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="pt-4 lg:pt-20 pb-16 bg-[#F8FAFC]">
      <div className="section-container max-w-4xl px-4">

        {/* Back link */}
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-sm hover:shadow transition-all mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Coordinators
        </Link>

        {/* ── Main Profile Card ── */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/40 overflow-hidden mb-8 relative">
          
          {/* Cover Banner (Vibrant Premium Sunset-Sky Multi-Gradient) */}
          <div className="h-36 sm:h-48 w-full bg-gradient-to-tr from-[#FFD3A5] via-[#FD8A9B] to-[#A8C5F0] relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-30"></div>
          </div>

          {/* Overlapping Avatar Area & Menu Button */}
          <div className="relative flex flex-row justify-between items-start px-6 sm:px-10 pb-4">
            {/* Avatar Frame with custom gradient border */}
            <div className="relative -mt-16 sm:-mt-20 flex-shrink-0 z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-white shadow-lg">
                <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-tr from-[#FFD3A5] via-[#FD8A9B] to-[#A8C5F0]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                    <SafeImage
                      src={buildCloudinaryUrl(profile.photoUrl, 'profile')}
                      alt={`${profile.name} - ISTE GMRIT`}
                      className="w-full h-full object-cover object-top"
                      fallbackType="profile"
                      name={profile.name}
                      objectPosition="center top"
                      eager
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Options Menu Dropdown */}
            <div className="mt-4">
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 transition-all focus:outline-none"
                  aria-label="Options"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-20 font-sans" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={handleCopyEmail}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      ✉️ Copy Email
                    </button>
                    {user.jntuNo && (
                      <button 
                        onClick={handleCopyJNTU}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        🪪 Copy JNTU ID
                      </button>
                    )}
                    <button 
                      onClick={handleShareProfile}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      🔗 Copy Profile Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Name & Primary Details */}
          <div className="px-6 sm:px-10 pb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{profile.name}</span>
              <span className="text-xs sm:text-sm font-semibold bg-blue-50 text-iste-blue border border-blue-100/50 px-2.5 py-0.5 rounded-full select-none">
                {user.role === 'student_coordinator' ? '@student' : '@faculty'}
              </span>
              {isFaculty && (
                <span className="inline-flex text-[#22C55E]" title="Verified Faculty">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7 3.1 5.52l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.46 3.4 1.46 1.89-3.2 3.61-.82-.34-3.7L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              )}
            </h1>

            {/* Tags and Handle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4 gap-y-2.5 mt-4 text-xs sm:text-sm text-slate-400 font-medium">
              <span className="text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs w-fit">
                @{profile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
              </span>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:inline" />
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-[#1A56DB] flex items-center justify-center text-white p-1 shadow-sm select-none">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L2 22h20L12 2zm0 4l6.5 13H5.5L12 6z"/>
                    </svg>
                  </div>
                  <span>{profile.role || roleLabels[user.role] || 'Member'}</span>
                </div>

                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50 border border-emerald-100/50' 
                    : 'text-slate-500 bg-slate-50 border border-slate-200/60'
                }`}>
                  {isActive 
                    ? (user.role === 'student_coordinator' ? 'Active Coordinator' : 'Active Faculty') 
                    : (user.role === 'student_coordinator' ? 'Passive Coordinator' : 'Passive Faculty')}
                </span>
              </div>
            </div>

            {/* Relocated About / Biography Section (placed inside details card) */}
            {profile.bio && (
              <div className="mt-5 pt-4 border-t border-slate-100/70">
                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Social Links Connect Section */}
            {profile.socialLinks && (Object.values(profile.socialLinks).some(Boolean)) && (
              <div className="mt-4 flex items-center gap-3">
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#24292F] hover:bg-[#24292F] hover:text-white transition-all duration-300"
                    aria-label="GitHub"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#E1306C] hover:bg-[#E1306C] hover:text-white transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Details Grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <DetailCard
            icon={
              <svg className="w-6 h-6 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            label="ISTE Role"
            value={profile.role || roleLabels[user.role] || '—'}
          />
          <DetailCard
            icon={
              <svg className="w-6 h-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            label="Branch"
            value={profile.branch}
          />
          <DetailCard
            icon={
              isStudent ? (
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.667 14H18a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h2.333" />
                </svg>
              )
            }
            label={isStudent ? "Academic Year" : "Designation"}
            value={isStudent ? profile.year : profile.designation}
          />
          <DetailCard
            icon={
              <svg className="w-6 h-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
              </svg>
            }
            label="Member Since"
            value={profile.createdAt ? formatDate(profile.createdAt) : '—'}
          />
        </motion.div>

        {/* ── More from Same Branch Section ── */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-5 select-none font-display">
              More from <span className="text-iste-blue font-extrabold">{profile.branch}</span>
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide">
              {related.map((rel) => (
                <MiniCard key={rel._id} profile={rel} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfileDetailPage;
