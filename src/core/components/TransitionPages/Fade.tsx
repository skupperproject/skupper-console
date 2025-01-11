import React, { FC, ReactElement, useState, useEffect } from 'react';

/**
 * This component is responsible for animating the common layer during route transitions.
 * It provides a fade-in effect when a new route is loaded, enhancing the user experience.
 */
const TransitionPage: FC<{ children: ReactElement; delay?: number; style?: React.CSSProperties }> = function ({
  children,
  delay = 0,
  style
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set the visibility to true after the specified delay.
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000); // Delay is converted from seconds to milliseconds.

    // Cleanup function to reset visibility when the component unmounts.
    return () => {
      clearTimeout(timeout);
      setIsVisible(false);
    };
  }, [delay]);

  return (
    <div
      style={{
        ...style,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        opacity: isVisible ? 1 : 0,
        transition: `opacity 250ms ease-in-out`
      }}
    >
      {children}
    </div>
  );
};

export default TransitionPage;
