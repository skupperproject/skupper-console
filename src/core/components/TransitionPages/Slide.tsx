import { FC, ReactNode, useRef } from 'react';

import { AnimatePresence, m } from 'framer-motion';

interface ILayoutProps {
  children: ReactNode;
  page: number;
}

const variants = {
  initialState: (direction: number) => ({
    x: direction > 0 ? '100vw' : '-100vw',
    opacity: 0
  }),
  animateState: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exiexitStatet: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100vw' : '-100vw',
    opacity: 0
  })
};

const TransitionSlide: FC<ILayoutProps> = function ({ children, page }) {
  const pageRef = useRef(page);
  const direction = pageRef.current - page;

  pageRef.current = page;

  return (
    <AnimatePresence custom={direction} initial={false}>
      <m.div
        key={page}
        custom={direction}
        variants={variants}
        initial="initialState"
        animate="animateState"
        exit="exitState"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
};

export default TransitionSlide;
