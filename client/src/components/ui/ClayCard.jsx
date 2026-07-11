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

  const baseClasses = `${getBgClass()} ${getRadiusClass()} ${getShadowClass()} transition-shadow duration-300 overflow-hidden ${className}`;

  if (isClickable) {
    const MotionComponent = typeof Component === 'string'
      ? (motion[Component] || motion.div)
      : motion(Component);
    return (
      <MotionComponent
        className={`${baseClasses} cursor-pointer select-none`}
        whileHover={{ 
          y: -4,
          boxShadow: '14px 14px 28px rgba(163,177,198,0.35), -14px -14px 28px rgba(255,255,255,0.2)'
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
