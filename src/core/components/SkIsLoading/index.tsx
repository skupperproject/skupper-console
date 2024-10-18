import { Bullseye, Spinner } from '@patternfly/react-core';

import { getTestsIds } from '../../../config/testIds';

const SkIsLoading = function ({ customSize = '150px' }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(3, 3, 3, 0.1)',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 1
      }}
    >
      <Bullseye data-testid={getTestsIds.loadingView()}>
        <Spinner diameter={customSize} />
      </Bullseye>
    </div>
  );
};

export default SkIsLoading;
