import { useState } from 'react';
import { Link } from 'react-router-dom';
import ClayCard from './ui/ClayCard';

/* ─────────────────────────────────────────────────────────────
   Category gradient colors for image fallbacks
   ──────────────────────────────────────────────────────────── */
const categoryGradients = {
  Announcement: { from: '#3B82F6', to: '#60A5FA' },
  Achievement:  { from: '#F59E0B', to: '#FBBF24' },
  Technical:    { from: '#7C3AED', to: '#A78BFA' },
  'ISTE News':  { from: '#0D9488', to: '#5EEAD4' },
};

/* ─────────────────────────────────────────────────────────────
   Category tag styles — below image (clay inset)
   ──────────────────────────────────────────────────────────── */
const categoryTagStyles = {
  Announcement: 'text-blue-600 bg-[#EEF1F5] shadow-clay-inset',
  Achievement:  'text-amber-600 bg-[#EEF1F5] shadow-clay-inset',
  Technical:    'text-violet-600 bg-[#EEF1F5] shadow-clay-inset',
  'ISTE News':  'text-teal-600 bg-[#EEF1F5] shadow-clay-inset',
};

/* ─────────────────────────────────────────────────────────────
   Utilities
   ──────────────────────────────────────────────────────────── */

/** Strip HTML tags and return plain text */
const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '');

/** Estimated reading time in minutes */
const getReadTime = (html) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/** Get excerpt from HTML content */
const getExcerpt = (html, maxLen = 120) => {
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '...' : text;
};

/** Format date as "3 Jul 2026" */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Get author initials for fallback avatar */
const getInitials = (name = '?') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

/* ═════════════════════════════════════════════════════════════
   HomeBlogCard — claymorphism blog card for homepage carousel
   ═════════════════════════════════════════════════════════════ */
const HomeBlogCard = ({ blog }) => {
  const [imgError, setImgError] = useState(false);
  const category = blog.category || 'ISTE News';
  const gradient = categoryGradients[category] || categoryGradients['ISTE News'];
  const tagClass = categoryTagStyles[category] || categoryTagStyles['ISTE News'];
  const showFallback = !blog.featuredImageUrl || imgError;

  const readTime = getReadTime(blog.content);
  const authorName = blog.author?.profileId?.name || blog.author?.email || 'ISTE GMRIT';
  const authorPhoto = blog.author?.profileId?.photoUrl || '';

  return (
    <ClayCard
      variant="raised"
      className="group flex flex-col h-full overflow-hidden p-3.5 hover:-translate-y-1.5 duration-300 transition-all cursor-pointer"
    >
      {/* ── Featured Image Area inside clay-inset frame ── */}
      <div className="relative w-full bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-2 flex-shrink-0 h-[180px] md:h-[130px]">
        <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset relative">
          {showFallback ? (
            /* Premium animated mesh gradient placeholder */
            <div
              className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
              style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
            >
              {/* Background floating clay orbs */}
              <div className="absolute w-24 h-24 rounded-full bg-white/15 blur-lg -top-6 -left-6 animate-pulse" />
              <div className="absolute w-20 h-20 rounded-full bg-black/10 blur-md -bottom-4 -right-4" />
              <div className="absolute w-10 h-10 rounded-full bg-white/10 blur-sm top-1/2 left-1/4 animate-bounce" style={{ animationDuration: '4.5s' }} />

              <span className="text-white text-xl md:text-2xl font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] z-10">
                {category}
              </span>
              {/* Document icon */}
              <svg className="w-6 h-6 text-white/70 mt-2 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ) : (
            /* Actual image with scale zoom on hover */
            <img
              src={blog.featuredImageUrl}
              alt={`${blog.title} featured image`}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </div>

        {/* Category badge — top-left */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full ${tagClass}`}>
            {category}
          </span>
        </div>

        {/* Read time badge — top-right */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-full bg-[#EEF1F5]/85 text-slate-700 shadow-clay-sm font-black">
            {readTime} min read
          </span>
        </div>
      </div>

      {/* ── Card Content ── */}
      <div className="flex flex-col flex-1 pt-3.5">
        {/* Title */}
        <h3 className="text-base font-black text-slate-850 line-clamp-2 mb-1.5 leading-snug group-hover:text-iste-blue transition-colors duration-200">
          {blog.title}
        </h3>

        {/* Excerpt */}
        {blog.content && (
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 md:line-clamp-1 mb-3 leading-relaxed font-bold">
            {getExcerpt(blog.content, 120)}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between gap-2 mb-4 mt-auto font-bold">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar */}
            {authorPhoto ? (
              <img
                src={authorPhoto}
                alt={authorName}
                className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 shadow-clay-sm"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            {/* Initials fallback */}
            <div
              className={`w-7 h-7 rounded-full bg-[#EEF1F5] flex-shrink-0 flex items-center justify-center text-[9px] font-extrabold text-iste-blue shadow-clay-sm ${authorPhoto ? 'hidden' : ''}`}
            >
              {getInitials(authorName)}
            </div>
            <span className="text-[11.5px] sm:text-xs text-slate-700 truncate">
              By {authorName}
            </span>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatDate(blog.publishedAt)}
          </span>
        </div>

        <Link
          to={`/blog/${blog._id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:bg-iste-blue hover:text-white hover:shadow-clay-md hover:scale-102 active:shadow-clay-pressed active:scale-98 transition-all duration-300 group/btn"
        >
          <span>Read More</span>
          <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </ClayCard>
  );
};

export default HomeBlogCard;
