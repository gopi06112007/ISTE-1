import React, { useState, useEffect } from 'react';

const HeroBackgroundMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      <div className="mobile-blob mobile-blob-1" />
      <div className="mobile-blob mobile-blob-2" />
    </div>
  );
};

export default HeroBackgroundMobile;
