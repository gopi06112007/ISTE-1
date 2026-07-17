import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const Footer = ({ forceRender = false }) => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const { theme, toggleTheme } = useTheme();

  if (location.pathname === '/' && !forceRender) {
    return null;
  }

  return (
    <footer className="w-full px-4 sm:px-6 lg:px-8 pb-4 pt-2">
      <div
        className="mx-auto max-w-6xl rounded-clay-lg shadow-clay-inset p-5 sm:p-6 transition-colors duration-300"
        style={{
          background: `linear-gradient(135deg, var(--bg-footer), var(--bg-footer-end))`
        }}
      >
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-clay-sm flex items-center justify-center shadow-clay-inset font-extrabold text-lg text-iste-blue" style={{ background: 'var(--bg-card-subtle)' }}>
                I
              </div>
              <div>
                <span className="text-lg font-extrabold block leading-tight" style={{ color: 'var(--text-primary)' }}>
                  ISTE GMRIT
                </span>
                <span className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
                  Student Chapter
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed font-medium md:max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Indian Society for Technical Education, GMRIT Student Chapter —
              fostering technical excellence and innovation among students.
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex justify-center w-full my-2">
            <div className="grid grid-cols-5 gap-3 sm:gap-4 justify-items-center">
              <a
                href="mailto:iste_student@gmrit.edu.in"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-clay-sm hover:shadow-clay-md hover:text-iste-blue active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
                aria-label="Email"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=GMR+Institute+of+Technology+Rajam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-clay-sm hover:shadow-clay-md hover:text-iste-blue active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
                aria-label="Location"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/_iste_gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-clay-sm hover:shadow-clay-md hover:text-iste-blue active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
                aria-label="Instagram"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/iste-gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-clay-sm hover:shadow-clay-md hover:text-iste-blue active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
                aria-label="LinkedIn"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/iste-gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-clay-sm hover:shadow-clay-md hover:text-iste-blue active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
                aria-label="GitHub"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              © {currentYear} ISTE Student Chapter, GMRIT. All rights reserved.
            </p>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              Built with ❤️ by ISTE GMRIT Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
