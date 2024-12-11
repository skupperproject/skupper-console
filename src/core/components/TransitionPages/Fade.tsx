import { CSSProperties, FC, ReactElement } from 'react';

import { LazyMotion, domAnimation, m } from 'framer-motion';

const TransitionPage: FC<{ children: ReactElement; delay?: number; style?: CSSProperties }> = function ({
  children,
  delay = 0,
  ...props
}) {
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
        transition={{ delay, duration: 0.25, ease: 'easeInOut' }}
        variants={transition}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', ...props.style }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

export default TransitionPage;
