import { CSSProperties, FC } from 'react';

import { Bullseye, Title } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';

import { getTestsIds } from '@config/testIds.config';
import TransitionPage from '@core/components/TransitionPages/Fade';

import { Labels } from './Loading.enum';

const PleaseWait = function () {
  return (
    <div>
      <div className="cog-wrapper">
        <CogIcon className="cog cog-main spinning-clockwise" color="var(--pf-global--palette--black-400)" />
        <CogIcon
          className="cog cog-secondary cog-upper spinning-clockwise--reverse"
          color="var(--pf-global--palette--black-400)"
        />
        <CogIcon
          className="cog cog-secondary cog-lower spinning-clockwise--reverse"
          color="var(--pf-global--palette--black-400)"
        />
      </div>
      <Title headingLevel="h2">{Labels.LoadingMessage}</Title>
    </div>
  );
};

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

const LoadingPage: FC<LoadingPageProps> = function ({ isFLoating = true }) {
  return (
    <TransitionPage delay={0.5}>
      <Bullseye
        className="sk-loading-page"
        style={isFLoating ? floatLoader : undefined}
        data-testid={getTestsIds.loadingView()}
      >
        <PleaseWait />
      </Bullseye>
    </TransitionPage>
  );
};

export default LoadingPage;
