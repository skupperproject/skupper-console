import React, { CSSProperties, FC } from 'react';

import { Spinner } from '@patternfly/react-core';

interface SkSpinnerProps {
  size?: number;
  style?: CSSProperties;
}

const SPINNER_DIAMETER = 80;

const SkSpinner: FC<SkSpinnerProps> = function ({ size = SPINNER_DIAMETER, ...props }) {
  return (
    <Spinner
      diameter={`${size}px`}
      style={
        props.style || {
          position: 'absolute',
          left: '50%',
          marginLeft: `-${size / 4}px`,
          top: '50%',
          marginTop: `-${size / 4}px`
        }
      }
    />
  );
};

export default SkSpinner;
