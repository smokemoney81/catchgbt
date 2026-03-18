import React from 'react';
import { motion } from 'framer-motion';
import { useNavigationContext } from '@/lib/NavigationContext';

export default function PageTransition({ children }) {
  const { direction } = useNavigationContext();

  // Slide in from right when going forward, from left when going back
  const variants = {
    initial: { opacity: 0, x: direction > 0 ? 40 : -40 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: direction > 0 ? -40 : 40 },
  };

  return (
    <motion.main
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gray-950"
      style={{
        minHeight: 'calc(100vh - 200px)',
        paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.main>
  );
}