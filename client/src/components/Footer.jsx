import { Link, useLocation } from 'react-router-dom';

const Footer = ({ forceRender = false }) => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  if (location.pathname === '/' && !forceRender) {
    return null;
  }

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/coordinators', label: 'Coordinators' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Blog' },
  ];

  return (
    <footer className="w-full px-4 sm:px-6 lg:px-8 pb-8 pt-4">
      <div className="mx-auto max-w-6xl bg-[#EEF1F5] rounded-clay-lg shadow-clay-inset p-8 sm:p-12 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#EEF1F5] rounded-clay-sm flex items-center justify-center shadow-clay-inset text-iste-blue font-extrabold text-lg">
                I
              </div>
              <div>
                <span className="text-lg font-extrabold text-gray-900 block leading-tight">
                  ISTE GMRIT
                </span>
                <span className="text-xs text-gray-500 font-bold block">
                  Student Chapter
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Indian Society for Technical Education, GMRIT Student Chapter —
              fostering technical excellence and innovation among students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-bold text-gray-600 hover:text-iste-blue transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-iste-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>GMR Institute of Technology, Rajam, Srikakulam, AP</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-iste-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>iste@gmrit.edu.in</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/_iste_gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#EEF1F5] flex items-center justify-center text-gray-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/iste-gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#EEF1F5] flex items-center justify-center text-gray-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/iste-gmrit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#EEF1F5] flex items-center justify-center text-gray-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-[0.95] transition-all duration-300"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-bold">
            © {currentYear} ISTE Student Chapter, GMRIT. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 font-bold">
            Built with ❤️ by ISTE GMRIT Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
