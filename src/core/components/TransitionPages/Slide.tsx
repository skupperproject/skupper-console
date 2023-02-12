import React, { FC } from 'react';

import { motion } from 'framer-motion';

const TransitionPage: FC<{ children: React.ReactElement; delay?: number }> = function ({
    children,
    delay = 0,
}) {
    const transition = {
        in: {
            opacity: 1,
        },
        out: {
            opacity: 0,
        },
    };

    return (
        <motion.span
            style={{ height: '100%' }}
            initial="out"
            animate="in"
            exit="out"
            transition={{ delay, duration: 0.15 }}
            variants={transition}
        >
            {children}
        </motion.span>
    );
};

export default TransitionPage;
