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
    <motion.span initial="out" animate="in" exit="out" transition={{ delay, duration: 0.175 }} variants={transition}>
      {children}
    </motion.span>
  );
};

export default TransitionPage;
