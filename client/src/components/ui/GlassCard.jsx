import React from 'react';

const GlassCard = ({ 
  as: Component = 'div',
  children, 
  className = '', 
  elevation = 'md',
  ...props 
}) => {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-xl shadow-slate-200/50',
    lg: 'shadow-2xl shadow-slate-200/60'
  };

  return (
    <Component 
      className={`bg-white/60 backdrop-blur-md border border-white/40 ${shadows[elevation]} rounded-2xl overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
