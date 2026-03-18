import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

export default function PageTransition({ pageKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="bg-gray-950"
        style={{
          minHeight: 'calc(100vh - 200px)',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}