import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Time-based greetings
  const [greeting, setGreeting] = useState('Welcome Back');

  // Mouse position state for interactive effects (brand panel)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const brandPanelRef = useRef(null);

  // Logo tilt rotation states
  const [logoTilt, setLogoTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Rotating slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: "Empowering Innovation", text: "ISTE fosters technical ingenuity and fuels cutting-edge development among engineering students." },
    { title: "Fostering Leadership", text: "Step up as a coordinator, manage impactful initiatives, and guide your peers to success." },
    { title: "Connected Community", text: "Collaborate across branches to bridge the gap between curriculum and industry standards." },
    { title: "Catalyzing Learning", text: "Organize workshops, engage in hackathons, and design the future of tech today." }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning');
    else if (hr < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleMouseMove = (e) => {
    if (!brandPanelRef.current) return;
    const rect = brandPanelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleLogoMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Calculate rotation (-15 to 15 degrees)
    const rotateX = -(y / (box.height / 2)) * 15;
    const rotateY = (x / (box.width / 2)) * 15;
    setLogoTilt({ rotateX, rotateY });
  };

  const handleLogoMouseLeave = () => {
    setLogoTilt({ rotateX: 0, rotateY: 0 });
  };

  const isJNTUNo = (val) => {
    const clean = val.trim();
    // Standard JNTU formatting e.g. 24341A0574
    return /^\d{2}[A-Z\d]{8,10}$/i.test(clean) || (/^\d+/.test(clean) && clean.length >= 8);
  };

  const isEmail = (val) => {
    const clean = val.trim();
    return clean.includes('@') && clean.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your credentials.');
      return;
    }

    setIsSubmitting(true);

    const result = await login(identifier.trim(), password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
    }

    setIsSubmitting(false);
  };

  if (isAuthenticated) {
    return null;
  }

  // Floating graphics specs
  const floatingElements = [
    { char: '✦', xOffset: -130, yOffset: -180, speed: 0.04, size: 'text-3xl', color: 'text-amber-400/30' },
    { char: '●', xOffset: 160, yOffset: -110, speed: -0.05, size: 'text-xl', color: 'text-iste-teal/40' },
    { char: '</>', xOffset: -160, yOffset: 120, speed: 0.03, size: 'text-base font-mono font-black', color: 'text-iste-blue/30' },
    { char: '{ }', xOffset: 140, yOffset: 150, speed: -0.04, size: 'text-xl font-mono font-black', color: 'text-purple-400/30' },
    { char: '✦', xOffset: 30, yOffset: -220, speed: 0.02, size: 'text-2xl', color: 'text-pink-400/20' },
    { char: '[x]', xOffset: -60, yOffset: 210, speed: -0.03, size: 'text-xs font-mono font-bold', color: 'text-emerald-400/30' },
  ];

  return (
    <PageTransition className="pt-16 lg:pt-0 min-h-screen w-full flex flex-col lg:flex-row relative bg-[#EEF1F5] overflow-hidden">
      {/* LEFT PANEL: Interactive Brand Hub (Visible on large screens) */}
      <div
        ref={brandPanelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-900 text-white select-none border-r border-slate-800"
      >
        {/* Background Mesh Gradient with Continuous Drift */}
        <div className="absolute inset-0 opacity-25 mix-blend-color-dodge bg-gradient-to-br from-[#0b1528] via-[#0f244a] to-[#0b1528] pointer-events-none" />

        {/* Floating Radial Glows */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.15, 0.9, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[400px] h-[400px] rounded-full bg-iste-blue/20 blur-3xl -top-20 -left-20"
          />
          <motion.div
            animate={{
              x: [0, -30, 40, 0],
              y: [0, 50, -20, 0],
              scale: [1, 0.85, 1.1, 1]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[450px] h-[450px] rounded-full bg-iste-violet/20 blur-3xl -bottom-20 -right-20"
          />
        </div>

        {/* Mouse follow spotlight glow */}
        <motion.div
          animate={{
            x: mousePos.x,
            y: mousePos.y,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30, mass: 0.3 }}
          className="absolute w-96 h-96 rounded-full bg-iste-teal/10 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: '50%', top: '50%' }}
        />

        {/* Floating elements */}
        {floatingElements.map((el, idx) => (
          <motion.div
            key={idx}
            animate={{
              x: el.xOffset + mousePos.x * el.speed,
              y: el.yOffset + mousePos.y * el.speed,
              rotate: [0, 360],
            }}
            transition={{
              x: { type: 'spring', stiffness: 60, damping: 18 },
              y: { type: 'spring', stiffness: 60, damping: 18 },
              rotate: { repeat: Infinity, duration: 20 + idx * 5, ease: 'linear' }
            }}
            className={`absolute pointer-events-none select-none ${el.size} ${el.color}`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {el.char}
          </motion.div>
        ))}

        {/* Spacer to push content down under the fixed navbar */}
        <div className="h-16 pointer-events-none" />

        {/* Centerpiece interactive Logo Container */}
        <div className="relative z-10 my-auto flex flex-col items-center">
          <motion.div
            onMouseMove={handleLogoMouseMove}
            onMouseLeave={handleLogoMouseLeave}
            animate={{
              rotateX: logoTilt.rotateX,
              rotateY: logoTilt.rotateY,
              transformPerspective: 800,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-48 h-48 bg-white/[0.04] backdrop-blur-md rounded-clay-lg p-8 flex items-center justify-center border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer select-none mb-8 hover:border-white/30 hover:bg-white/[0.07] transition-colors duration-300"
            title="ISTE Logo - Drag Hover"
          >
            <img
              src="/istelogo.webp"
              alt="ISTE Logo Red"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform scale-110"
            />
          </motion.div>

          <h1 className="text-4xl font-display font-black text-white text-center leading-tight mb-3">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-teal to-blue-400">Coordinator</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 text-center max-w-sm">
            Sign in to manage and lead events, write tech blogs, and update your coordinator profile.
          </p>
        </div>

        {/* Interactive Feature Slider */}
        <div className="relative z-10 h-28 flex flex-col justify-center text-center max-w-sm mx-auto border-t border-white/5 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-1.5"
            >
              <h3 className="text-sm font-accent font-black tracking-widest text-iste-teal uppercase">
                {slides[currentSlide].title}
              </h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed px-4">
                {slides[currentSlide].text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slider Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'bg-iste-teal w-4.5' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Sleek Claymorphic Form Space */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <ClayCard variant="raised" size="lg" className="w-full max-w-md p-8 sm:p-10 animate-scale-in mt-10 lg:mt-16">
          {/* Mobile Header (Shown on mobile, hidden on lg) */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-20 h-20 bg-white/70 rounded-clay-md flex items-center justify-center mx-auto mb-4 shadow-clay-sm">
              <img src="/istelogo.webp" alt="ISTE Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 leading-none">
              {greeting}
            </h1>
            <p className="text-xs font-extrabold text-slate-400 mt-2">
              Sign in to your coordinator account
            </p>
          </div>

          {/* Desktop Heading (Hidden on mobile) */}
          <div className="hidden lg:block mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">
              Sign In
            </h2>
            <p className="text-xs font-extrabold text-slate-400 mt-2">
              Please enter your assigned coordinator credentials below.
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 rounded-clay-sm text-sm text-red-600 shadow-clay-inset font-bold overflow-hidden"
                id="login-error"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier Input */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="identifier"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300"
                >
                  JNTU No or Email
                </label>
                {identifier && (
                  <AnimatePresence>
                    {isJNTUNo(identifier) ? (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-iste-blue/10 text-iste-blue text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                      >
                        JNTU No
                      </motion.span>
                    ) : isEmail(identifier) ? (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-iste-violet/10 text-iste-violet text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                      >
                        Email
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                )}
              </div>
              <div className="relative">
                {/* Left Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={`w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 ${
                    error ? 'border-red-300/40' : 'border-transparent focus:border-iste-blue/20'
                  }`}
                  placeholder="e.g., 24341A0574 or name@gmrit.edu.in"
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                {/* Left Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 ${
                    error ? 'border-red-300/40' : 'border-transparent focus:border-iste-blue/20'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                {/* Password show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EEF1F5] text-slate-400 hover:text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300 flex items-center justify-center"
                  aria-label="Toggle password visibility"
                  disabled={isSubmitting}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? 'visible' : 'hidden'}
                      initial={{ opacity: 0, scale: 0.75, rotate: -25 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.75, rotate: 25 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Submit Button with Custom Hover Feedback */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full h-[50px] rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2.5 border-iste-blue/30 border-t-iste-blue rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          {/* Help Desk Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 select-none">
            <p className="text-[10px] text-slate-400 font-extrabold text-center leading-relaxed">
              Credentials are assigned by your Faculty Coordinator.
              <br />
              Contact your branch coordinator if you need access.
            </p>
          </div>
        </ClayCard>
      </div>
    </PageTransition>
  );
};

export default Login;
