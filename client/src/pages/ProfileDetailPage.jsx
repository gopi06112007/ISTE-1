import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import PageTransition from '../components/ui/PageTransition';
import SafeImage from '../components/SafeImage';
import { buildCloudinaryUrl } from '../utils/cloudinary';
import ClayCard from '../components/ui/ClayCard';
import BentoGrid from '../components/ui/BentoGrid';

/* ─── Role helpers ───────────────────────────────────────── */
const roleLabels = {
  student_coordinator: 'Student Coordinator',
  branch_faculty: 'Branch Faculty',
  central_faculty: 'Central Faculty',
};

const roleBadgeClasses = {
  student_coordinator: 'text-emerald-600 bg-[#EEF1F5] shadow-clay-inset font-bold',
  branch_faculty: 'text-blue-600 bg-[#EEF1F5] shadow-clay-inset font-bold',
  central_faculty: 'text-orange-600 bg-[#EEF1F5] shadow-clay-inset font-bold',
};

/* ─── Stagger animation variants ────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Skeleton loader ────────────────────────────────────── */
const SkeletonHero = () => (
  <div className="animate-pulse">
    <div className="rounded-clay-lg bg-[#EEF1F5] shadow-clay-sm p-8 lg:p-12 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
      <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gray-200 flex-shrink-0 shadow-clay-inset" />
      <div className="flex-1 space-y-4 w-full">
        <div className="h-8 bg-gray-200 rounded-clay-sm w-2/3" />
        <div className="h-5 bg-gray-200 rounded-clay-sm w-1/3" />
        <div className="h-4 bg-gray-200 rounded-clay-sm w-1/4" />
        <div className="flex gap-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-9 w-9 bg-gray-200 rounded-full" />)}
        </div>
      </div>
    </div>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-[#EEF1F5] rounded-clay-sm shadow-clay-sm" />)}
    </div>
  </div>
);

/* ─── Detail card ───────────────────────────────────────── */
const DetailCard = ({ icon, label, value }) => (
  <motion.div variants={item} className="h-full">
    <ClayCard
      variant="raised"
      className="p-5 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-2 select-none">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-slate-800 font-extrabold text-sm">{value || '—'}</p>
    </ClayCard>
  </motion.div>
);

/* ─── Mini coordinator card for "More from branch" ──────── */
const MiniCard = ({ profile }) => {
  const user = profile.userId || {};
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

  return (
    <ClayCard
      as={Link}
      to={`/coordinators/${profile._id}`}
      interactive={true}
      accent={accentColor}
      className="w-[180px] min-w-[180px] max-w-[180px] flex-shrink-0 overflow-hidden flex flex-col p-3"
    >
      <div className="w-full aspect-square overflow-hidden bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-1.5 flex-shrink-0">
        <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset bg-white">
          <SafeImage
            src={profile.photoUrl}
            alt={`${profile.name} - ISTE GMRIT`}
            className="w-full h-full object-cover object-top"
            fallbackType="profile"
            name={profile.name}
            objectPosition="center top"
          />
        </div>
      </div>
      <div className="pt-3">
        <p className="text-sm font-extrabold text-slate-800 line-clamp-1">{profile.name}</p>
        <p className="text-xs text-slate-500 mt-1 font-bold line-clamp-1">{profile.role || roleLabels[user.role] || ''}</p>
      </div>
    </ClayCard>
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

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — ISTE GMRIT`;
    }
    return () => { document.title = 'ISTE GMRIT — Student Chapter'; };
  }, [profile]);

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

  /* ── Back URL preserving filters ─── */
  const backUrl = location.state?.fromSearch
    ? `/coordinators${location.state.fromSearch}`
    : '/coordinators';

  /* ── Loading skeleton ─────────────── */
  if (loading) {
    return (
      <PageTransition className="pt-20 pb-16">
        <div className="section-container max-w-5xl">
          <div className="mb-8 h-4 w-36 bg-gray-200 rounded animate-pulse" />
          <SkeletonHero />
        </div>
      </PageTransition>
    );
  }

  /* ── Error / 404 states ──────────── */
  if (error === 'not_found' || !profile) {
    return (
      <PageTransition className="pt-20 min-h-[60vh] flex items-center justify-center">
        <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
          <p className="text-6xl mb-4 select-none">🔍</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 select-none">Profile Not Found</h2>
          <p className="text-slate-500 font-bold text-sm mb-6 select-none">This coordinator's profile doesn't exist or was removed.</p>
          <Link
            to="/coordinators"
            className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
          >
            ← Back to Coordinators
          </Link>
        </ClayCard>
      </PageTransition>
    );
  }

  if (error === 'network') {
    return (
      <PageTransition className="pt-20 min-h-[60vh] flex items-center justify-center">
        <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
          <p className="text-6xl mb-4 select-none">⚠️</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 select-none">Connection Error</h2>
          <p className="text-slate-500 font-bold text-sm mb-6 select-none">Unable to load this profile. Please check your connection.</p>
          <button
            onClick={fetchProfile}
            className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
          >
            Try Again
          </button>
        </ClayCard>
      </PageTransition>
    );
  }

  const user = profile.userId || {};
  const isStudent = user.role === 'student_coordinator';

  return (
    <PageTransition className="pt-20 pb-16">
      <div className="section-container max-w-5xl">

        {/* Back link - clay button style */}
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Coordinators
        </Link>

        {/* ── Hero card wrapped in branch-tinted raised ClayCard ── */}
        <ClayCard
          variant="raised"
          tint={profile.branch}
          className="p-8 lg:p-12 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">

            {/* Profile photo inside padded clay-inset circle frame */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              className="flex-shrink-0"
            >
              <div className="w-36 h-36 lg:w-44 lg:h-44 bg-[#EEF1F5] rounded-full overflow-hidden p-2 shadow-clay-inset">
                <div className="w-full h-full rounded-full overflow-hidden shadow-clay-inset bg-white">
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
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left select-none">
              {/* Role badge */}
              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-clay-inset bg-[#EEF1F5] ${
                user.role === 'student_coordinator' ? 'text-emerald-600' :
                user.role === 'branch_faculty' ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {roleLabels[user.role] || user.role}
              </span>

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-1 leading-tight">
                {profile.name}
              </h1>

              {/* ISTE role / designation */}
              {(profile.role || profile.designation) && (
                <p className="text-iste-blue font-extrabold text-lg mb-3">
                  {profile.role || profile.designation}
                </p>
              )}

              {/* Branch + Year / JNTU / Email */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-500 mb-5 font-bold">
                {profile.branch && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-iste-blue" />
                    {profile.branch}
                  </span>
                )}
                {isStudent && profile.year && (
                  <span className="flex items-center gap-1.5">🎓 {profile.year}</span>
                )}
                {isStudent && user.jntuNo && (
                  <span className="flex items-center gap-1.5 font-mono text-xs">🪪 {user.jntuNo}</span>
                )}
                {!isStudent && user.email && (
                  <span className="flex items-center gap-1.5">✉️ {user.email}</span>
                )}
              </div>

              {/* Social links - Clay buttons */}
              {profile.socialLinks && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-clay-sm bg-[#EEF1F5] text-blue-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all text-sm font-bold"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-clay-sm bg-[#EEF1F5] text-[#24292F] shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all text-sm font-bold"
                      aria-label="GitHub"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      GitHub
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-clay-sm bg-[#EEF1F5] text-pink-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all text-sm font-bold"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </ClayCard>

        {/* ── About / Bio ── */}
        <ClayCard
          variant="raised"
          className="p-6 lg:p-8 mb-6"
        >
          <h2 className="text-lg font-extrabold text-slate-800 mb-3 flex items-center gap-2 select-none">
            <span>👤</span> About
          </h2>
          <p className="text-slate-600 leading-relaxed font-semibold">
            {profile.bio || "This coordinator hasn't added a bio yet."}
          </p>
        </ClayCard>

        {/* ── Details grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <DetailCard
            icon="🏷️"
            label="ISTE Role"
            value={profile.role || roleLabels[user.role] || '—'}
          />
          <DetailCard
            icon="🏫"
            label="Branch"
            value={profile.branch}
          />
          {isStudent && (
            <DetailCard
              icon="🎓"
              label="Academic Year"
              value={profile.year}
            />
          )}
          {!isStudent && profile.designation && (
            <DetailCard
              icon="💼"
              label="Designation"
              value={profile.designation}
            />
          )}
          <DetailCard
            icon="📅"
            label="Member Since"
            value={profile.createdAt ? formatDate(profile.createdAt) : '—'}
          />
        </motion.div>

        {/* ── More from same branch ── */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className="text-lg font-extrabold text-slate-800 mb-4 select-none">
              More from <span className="text-iste-blue">{profile.branch}</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
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
