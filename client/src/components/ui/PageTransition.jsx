import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.1 } 
  },
  exit: { 
    opacity: 0, 
    y: -15, 
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } 
  }
};

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
