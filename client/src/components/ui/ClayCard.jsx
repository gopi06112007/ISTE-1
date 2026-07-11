import React from 'react';
import { motion } from 'framer-motion';

const ClayCard = ({
  as: Component = 'div',
  children,
  className = '',
  variant = 'raised', // 'raised' | 'inset' | 'pressed'
  tint, // 'cse' | 'ece' | 'eee' | 'mech' | 'civil' | 'it'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  interactive = false,
  accent, // 'blue' | 'violet' | 'teal' | 'amber' | 'rose' | 'slate'
  ...props
}) => {
  const isClickable = interactive || props.onClick || props.whileTap;

  const tintMap = {
    cse: 'bg-[#A8C5F0]',
    ece: 'bg-[#C9B8F0]',
    eee: 'bg-[#F0D9A8]',
    mech: 'bg-[#C7CDD6]',
    civil: 'bg-[#A8E0D4]',
    it: 'bg-[#F0B8D4]',
  };

  const getBgClass = () => {
    if (!tint) return 'bg-[#EEF1F5]';
    const key = tint.toLowerCase();
    return tintMap[key] || `bg-[${tint}]`;
  };

  const getRadiusClass = () => {
    switch (size) {
      case 'sm': return 'rounded-clay-sm';
      case 'lg': return 'rounded-clay-lg';
      case 'xl': return 'rounded-clay-xl';
      case 'md':
      default:
        return 'rounded-clay-md';
    }
  };

  const getShadowClass = () => {
    if (variant === 'pressed') return 'shadow-clay-pressed';
    if (variant === 'inset') return 'shadow-clay-inset';
    return 'shadow-clay-md';
  };

  const accentBorderMap = {
    blue: 'border-t-4 border-t-iste-blue/45',
    violet: 'border-t-4 border-t-iste-violet/45',
    teal: 'border-t-4 border-t-iste-teal/45',
    amber: 'border-t-4 border-t-iste-amber/45',
    rose: 'border-t-4 border-t-[#DB2777]/45',
    slate: 'border-t-4 border-t-slate-500/35',
  };

  const getAccentBorderClass = () => {
    if (tint) return '';
    if (accent) return accentBorderMap[accent.toLowerCase()] || '';
    return '';
  };

  const baseClasses = `${getBgClass()} ${getRadiusClass()} ${getShadowClass()} ${getAccentBorderClass()} transition-all duration-300 overflow-hidden ${className}`;

  if (isClickable) {
    const MotionComponent = typeof Component === 'string'
      ? (motion[Component] || motion.div)
      : motion(Component);
    return (
      <MotionComponent
        className={`${baseClasses} cursor-pointer select-none`}
        whileHover={{ 
          y: -4,
          boxShadow: accent === 'blue'
            ? '14px 14px 28px rgba(26, 86, 219, 0.16), -14px -14px 28px rgba(255, 255, 255, 0.2)'
            : accent === 'violet'
            ? '14px 14px 28px rgba(124, 92, 246, 0.16), -14px -14px 28px rgba(255, 255, 255, 0.2)'
            : accent === 'teal'
            ? '14px 14px 28px rgba(13, 148, 136, 0.16), -14px -14px 28px rgba(255, 255, 255, 0.2)'
            : accent === 'amber'
            ? '14px 14px 28px rgba(245, 158, 11, 0.16), -14px -14px 28px rgba(255, 255, 255, 0.2)'
            : accent === 'rose'
            ? '14px 14px 28px rgba(219, 39, 119, 0.16), -14px -14px 28px rgba(255, 255, 255, 0.2)'
            : '14px 14px 28px rgba(26, 86, 219, 0.12), -14px -14px 28px rgba(255, 255, 255, 0.2)'
        }}
        whileTap={{ 
          scale: 0.97,
          boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.15)'
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <Component className={baseClasses} {...props}>
      {children}
    </Component>
  );
};

export default ClayCard;
