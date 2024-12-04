import { CSSProperties, FC } from 'react';

import { Spinner } from '@patternfly/react-core';

import { LoadingLabels } from './Loading.enum';
import { getTestsIds } from '../../../config/testIds';
import SKEmptyData from '../SkEmptyData';
import TransitionPage from '../TransitionPages/Fade';

const floatLoader: CSSProperties = {
  top: 0,
  position: 'absolute',
  right: 0,
  width: '100%',
  height: '100%',
  zIndex: 100
};

interface LoadingPageProps {
  isFLoating?: boolean;
}

const LoadingPage: FC<LoadingPageProps> = function ({ isFLoating = false }) {
  return (
    <TransitionPage delay={0.75} style={isFLoating ? floatLoader : undefined}>
      <SKEmptyData
        icon={Spinner}
        message=""
        description={LoadingLabels.LoadingMessage}
        dataTestid={getTestsIds.loadingView()}
      />
    </TransitionPage>
  );
};

export default LoadingPage;
