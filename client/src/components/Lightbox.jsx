import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from './SafeImage';

const Lightbox = ({
  photos = [],
  initialIndex = 0,
  currentIndex: externalIndex,
  albumName = '',
  branch = '',
  isOpen = true,
  onClose,
  onNext,
  onPrev,
}) => {
  const [internalIndex, setInternalIndex] = useState(initialIndex);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    setInternalIndex(initialIndex);
  }, [initialIndex]);

  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const activePhoto = photos[activeIndex] || '';

  const goNext = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (photos.length > 0) {
      setInternalIndex((prev) => (prev + 1) % photos.length);
    }
  }, [onNext, photos.length]);

  const goPrev = useCallback(() => {
    if (onPrev) {
      onPrev();
    } else if (photos.length > 0) {
      setInternalIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  }, [onPrev, photos.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      goNext();
    } else if (diff < -minSwipeDistance) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex flex-col justify-between overflow-hidden bg-slate-950/95 backdrop-blur-2xl text-white select-none"
      >
        {/* Scrim backdrop - clicking anywhere on background closes viewer */}
        <div className="absolute inset-0 bg-transparent" onClick={onClose} />

        {/* Floating Top Controls (No menu bar) */}
        <div className="relative z-30 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
          {/* Top-left subtle album info pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/80 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg">
            {branch && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-blue-600 text-white">
                {branch}
              </span>
            )}
            <span className="text-xs font-bold text-slate-200 truncate max-w-[180px] sm:max-w-xs">
              {albumName || 'Gallery'}
            </span>
            <span className="text-xs font-semibold text-slate-400 border-l border-white/15 pl-2.5">
              {activeIndex + 1} / {photos.length}
            </span>
          </div>

          {/* Top-right floating Close Button */}
          <button
            onClick={onClose}
            className="pointer-events-auto p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-95"
            aria-label="Close viewer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── MAIN POSTER / IMAGE CANVAS ── */}
        <div
          className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          {/* Left Arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 sm:left-6 z-30 w-12 h-12 rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-md text-white hover:bg-slate-800 hover:scale-110 active:scale-95 shadow-2xl flex items-center justify-center transition-all"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 sm:right-6 z-30 w-12 h-12 rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-md text-white hover:bg-slate-800 hover:scale-110 active:scale-95 shadow-2xl flex items-center justify-center transition-all"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Animated Poster / Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto}
                alt={`${albumName || 'Poster'} - ${activeIndex + 1}`}
                className="max-h-[84vh] max-w-[94vw] sm:max-w-[88vw] object-contain rounded-2xl ring-1 ring-white/10"
                style={{
                  filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.85))',
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── BOTTOM THUMBNAILS ── */}
        {photos.length > 1 && (
          <footer className="relative z-30 flex justify-center p-3 sm:pb-5 pointer-events-auto">
            <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 bg-slate-900/80 border border-white/15 backdrop-blur-xl rounded-2xl max-w-[92vw] sm:max-w-3xl overflow-x-auto scrollbar-hide shadow-2xl">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (onNext || onPrev) {
                      const diff = i - activeIndex;
                      if (diff > 0) {
                        for (let k = 0; k < diff; k++) onNext?.();
                      } else if (diff < 0) {
                        for (let k = 0; k < Math.abs(diff); k++) onPrev?.();
                      }
                    } else {
                      setInternalIndex(i);
                    }
                  }}
                  className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden transition-all duration-200 active:scale-95 ${
                    i === activeIndex
                      ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105 opacity-100 shadow-lg shadow-sky-500/30'
                      : 'opacity-40 hover:opacity-100 border border-white/10 hover:border-white/30'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <SafeImage
                    src={photo}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    fallbackType="gallery"
                  />
                </button>
              ))}
            </div>
          </footer>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default Lightbox;
