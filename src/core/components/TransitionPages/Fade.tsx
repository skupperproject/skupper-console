import { FC, ReactElement } from 'react';

import { motion } from 'framer-motion';

const TransitionPage: FC<{ children: ReactElement; delay?: number }> = function ({ children, delay = 0 }) {
  const transition = {
    in: {
      opacity: 1
    },
    out: {
      opacity: 0
    }
  };

  return (
    <motion.div
      initial="out"
      animate="in"
      exit="out"
      transition={{ delay, duration: 0.2 }}
      variants={transition}
      style={{ flex: 1, display: 'grid', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default TransitionPage;
