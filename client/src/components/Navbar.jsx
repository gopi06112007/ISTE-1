import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import ClayCard from './ui/ClayCard';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  // Track scroll for navbar visual adjustments
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/coordinators', label: 'Coordinators' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Blog' },
  ];

  /* ── Mobile bottom bar tabs (5 main + Login/Dashboard) ── */
  const mobileNavLinks = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/coordinators',
      label: 'Team',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      to: '/events',
      label: 'Events',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: '/gallery',
      label: 'Gallery',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: '/blog',
      label: 'Blog',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    isAuthenticated
      ? {
          to: '/dashboard',
          label: 'Board',
          icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        }
      : {
          to: '/login',
          label: 'Login',
          icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          ),
        },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  /* ── Swipe right-to-left on mobile → navigate to Login ── */
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = Math.abs(touchStartY.current - endY);
    const minSwipe = 120; // strong swipe threshold

    // Strong horizontal left-swipe and not vertical scroll
    if (diffX > minSwipe && diffY < 80) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [isAuthenticated, navigate]);

  /* Removed global document touch listeners so swipe gestures only work when initiated on the bottom bar itself */

  return (
    <>
      {/* Mobile-only floating ISTE logo — visible only on Home page */}
      {location.pathname === '/' && (
        <>
          {/* Straight horizontal background blur layer at the top */}
          <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#EEF1F5]/80 via-[#EEF1F5]/40 to-transparent backdrop-blur-md z-[45] lg:hidden pointer-events-none" />
          
          <Link
            to="/"
            className="fixed top-3 left-4 z-50 lg:hidden flex items-center gap-2.5 group"
          >
            <div className="w-14 h-14 flex items-center justify-center group-active:scale-95 transition-transform">
              <img src="/istelogo.webp" alt="ISTE Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-gray-900 tracking-tight leading-none">ISTE</span>
              <span className="text-[9px] uppercase tracking-wider font-jetbrains text-iste-blue font-bold mt-0.5">GMRIT</span>
            </div>
          </Link>
        </>
      )}

      {/* Top Floating Header — Desktop only */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
        <ClayCard
          as="header"
          variant="raised"
          size="lg"
          className={`mx-auto max-w-6xl pointer-events-auto transition-all duration-500 ease-spring ${
            isScrolled ? 'py-2' : 'py-3'
          }`}
        >
          <nav className="flex items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group relative z-10">
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-spring">
                <img src="/istelogo.webp" alt="ISTE Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
                  ISTE
                </span>
                <span className="text-[10px] uppercase tracking-wider font-jetbrains text-iste-blue font-bold mt-0.5">
                  GMRIT Student Chapter
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div 
              className="hidden lg:flex items-center relative gap-1 select-none"
              onMouseLeave={() => setHoveredLink(null)}
            >
              {navLinks.map((link) => {
                const active = isActive(link.to);
                const hovered = hoveredLink === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onMouseEnter={() => setHoveredLink(link.to)}
                    className="relative px-5 py-2 text-sm font-extrabold transition-colors duration-300 z-10"
                  >
                    <span className={active ? 'text-iste-blue' : hovered ? 'text-[#1A56DB] transition-colors duration-300' : 'text-slate-600 transition-colors duration-300'}>
                      {link.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-[#EEF1F5] rounded-full shadow-clay-inset -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {hovered && !active && (
                      <motion.div
                        layoutId="hoverNavPill"
                        className="absolute inset-0 bg-[#EEF1F5]/60 rounded-full shadow-clay-inset -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-4 relative z-10">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="px-5 py-2 rounded-full text-sm font-bold bg-[#EEF1F5] text-slate-800 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-red-500 hover:bg-[#EEF1F5] hover:shadow-clay-inset transition-all duration-300"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </ClayCard>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* Mobile Bottom Navigation Bar                         */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none select-none pb-[env(safe-area-inset-bottom)]">
        {/* Stronger gradient fade mask to completely hide footer text and background details scrolling behind bottom bar */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#EEF1F5] via-[#EEF1F5] to-transparent pointer-events-none" />

        <div className="relative flex justify-center px-3 pb-2.5">
          <nav
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="pointer-events-auto flex items-center w-full max-w-[420px] p-1.5 rounded-[22px] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_-2px_20px_rgba(0,0,0,0.06),0_4px_30px_rgba(0,0,0,0.08)]"
            aria-label="Mobile Navigation"
          >
            {/* ── 5 Main Nav Tabs ── */}
            <div className="flex items-center flex-1">
              {mobileNavLinks.slice(0, 5).map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 flex-1 ${
                      active
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25 px-2.5 py-2'
                        : 'text-slate-400 py-2'
                    }`}
                  >
                    <span className={`flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${active ? 'scale-105' : ''}`}>
                      {link.icon}
                    </span>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="overflow-hidden whitespace-nowrap text-[11px] font-black tracking-tight"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>

            {/* ── Separator ── */}
            <div className="w-px h-6 bg-slate-200/80 mx-1 flex-shrink-0" />

            {/* ── Login / Dashboard Button ── */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-iste-blue text-white shadow-lg shadow-iste-blue/30 px-3 py-2'
                      : 'text-iste-blue px-2 py-2'
                  }`}
                >
                  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <AnimatePresence initial={false}>
                    {isActive('/dashboard') && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="overflow-hidden whitespace-nowrap text-[11px] font-black"
                      >
                        Board
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  aria-label="Logout"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  isActive('/login')
                    ? 'bg-iste-blue text-white shadow-lg shadow-iste-blue/30 px-3.5 py-2'
                    : 'bg-iste-blue/10 text-iste-blue px-3 py-2'
                }`}
              >
                <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <AnimatePresence initial={false}>
                  {isActive('/login') ? (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="overflow-hidden whitespace-nowrap text-[11px] font-black"
                    >
                      Login
                    </motion.span>
                  ) : (
                    <span className="text-[11px] font-black">Login</span>
                  )}
                </AnimatePresence>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
