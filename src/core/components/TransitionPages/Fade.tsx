import { FC, ReactElement } from 'react';

import { LazyMotion, domAnimation, m } from 'framer-motion';

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
    <LazyMotion strict features={domAnimation}>
      <m.div
        initial="out"
        animate="in"
        exit="out"
        transition={{ delay, duration: 0.3, ease: 'easeInOut' }}
        variants={transition}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

export default TransitionPage;
