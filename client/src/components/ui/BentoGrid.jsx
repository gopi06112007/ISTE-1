import React from 'react';

const BentoGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)] ${className}`}>
      {children}
    </div>
  );
};

export default BentoGrid;
