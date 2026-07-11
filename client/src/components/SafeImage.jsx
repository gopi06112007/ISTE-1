import { useState } from 'react';
import { buildCloudinaryUrl } from '../utils/cloudinary';

/**
 * Generate an SVG data URL for an initials-based avatar placeholder.
 */
const getInitialsDataUrl = (name = '?') => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1A56DB"/>
          <stop offset="100%" style="stop-color:#60A5FA"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <text x="200" y="230" font-family="Arial,sans-serif" font-size="160"
            font-weight="700" fill="white" text-anchor="middle"
            dominant-baseline="middle">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a branded placeholder for non-profile images.
 */
const getPlaceholderDataUrl = (type, label = '') => {
  const configs = {
    event: { bg: '#EFF6FF', accent: '#1A56DB', icon: '📅', text: label || 'Event' },
    gallery: { bg: '#F0FDF4', accent: '#059669', icon: '🖼️', text: label || 'Photo' },
    blog: { bg: '#FDF4FF', accent: '#7C3AED', icon: '📝', text: label || 'Blog' },
  };
  const c = configs[type] || configs.gallery;
  const safeLbl = (c.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="${c.bg}"/>
      <text x="400" y="190" font-family="Arial" font-size="80" text-anchor="middle">${c.icon}</text>
      <text x="400" y="280" font-family="Arial,sans-serif" font-size="28" fill="${c.accent}"
            font-weight="600" text-anchor="middle">${safeLbl}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

/**
 * SafeImage — a drop-in replacement for <img> that:
 *  - Applies Cloudinary URL transformations automatically
 *  - Swaps to a styled fallback on error (no broken image icons)
 *  - Always lazy-loads below-the-fold images
 *
 * Props:
 *  src            — original image URL
 *  alt            — descriptive alt text
 *  className      — Tailwind / CSS classes passed to <img>
 *  objectPosition — CSS object-position value (default: 'center top' for profiles, 'center' otherwise)
 *  fallbackType   — 'profile' | 'event' | 'gallery' | 'blog'
 *  name           — Person's name (used to generate initials fallback for profiles)
 *  eager          — If true, skips lazy loading (use for above-the-fold hero images)
 */
const SafeImage = ({
  src,
  alt = '',
  className = '',
  objectPosition,
  fallbackType = 'gallery',
  name = '',
  eager = false,
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  const optimizedSrc = buildCloudinaryUrl(src, fallbackType);

  const defaultPosition = fallbackType === 'profile' ? 'center top' : 'center center';
  const position = objectPosition || defaultPosition;

  const fallbackSrc =
    fallbackType === 'profile'
      ? getInitialsDataUrl(name || alt)
      : getPlaceholderDataUrl(fallbackType, alt);

  const finalSrc = !src || errored ? fallbackSrc : optimizedSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={{ objectPosition: position, ...rest.style }}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
};

export default SafeImage;
