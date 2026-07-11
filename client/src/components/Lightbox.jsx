import { useState, useEffect, useCallback, useRef } from 'react';
import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const Lightbox = ({ photos, initialIndex = 0, albumName = '', onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background scrim */}
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      {/* Floating clay-lg card */}
      <ClayCard
        variant="raised"
        size="lg"
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#EEF1F5] shadow-clay-lg flex flex-col overflow-hidden z-10 p-4"
      >
        {/* Top-right close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
          aria-label="Close lightbox"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Album name & counter */}
        <div className="absolute top-6 left-6 z-10 select-none">
          <h3 className="text-slate-800 font-extrabold text-sm">{albumName}</h3>
          <p className="text-slate-500 font-bold text-xs">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>

        {/* Navigation arrows (clay-pressed style) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden md:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden md:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Container with clay-inset style */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-grow flex items-center justify-center bg-[#EEF1F5] rounded-clay-md shadow-clay-inset p-4 relative overflow-hidden select-none touch-pan-y"
          style={{ minHeight: '300px' }}
        >
          <img
            src={photos[currentIndex]}
            alt={`${albumName} photo ${currentIndex + 1}`}
            className="max-w-full max-h-[55vh] object-contain rounded-clay-sm pointer-events-none"
            key={currentIndex}
          />
        </div>

        {/* Thumbnail strip - clay styled */}
        {photos.length > 1 && (
          <div className="mt-4 flex items-center gap-3 max-w-full overflow-x-auto px-4 py-3 bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset select-none">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-clay-sm overflow-hidden border-2 transition-all active:scale-95 ${
                  i === currentIndex
                    ? 'border-iste-blue scale-105 shadow-clay-sm'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
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
        )}
      </ClayCard>
    </div>
  );
};

export default Lightbox;
