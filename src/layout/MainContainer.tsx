import { FC, ReactElement, Suspense } from 'react';

import {
  Divider,
  Flex,
  FlexItem,
  PageGroup,
  PageSection,
  Content,
  ContentVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';

import LoadingPage from '../core/components/SkLoading';
import SkNavigationViewLink from '../core/components/SkNavigationViewLink';
import SkUpdateDataButton from '../core/components/SkUpdateDataButton';
import TransitionPage from '../core/components/TransitionPages/Fade';
import { TopologyLabels } from '../pages/Topology/Topology.enum';

import '@patternfly/patternfly/patternfly-addons.css';

interface MainContainerProps {
  dataTestId?: string;
  title?: string;
  link?: string;
  linkLabel?: string;
  iconName?: 'topologyIcon' | 'listIcon';
  description?: string;
  hasMainContentPadding?: boolean;
  navigationComponent?: ReactElement;
  mainContentChildren: ReactElement;
}

/** Subcomponent for rendering the header section */
const HeaderSection: FC<{
  title?: string;
  description?: string;
  link?: string;
  linkLabel?: string;
  iconName?: 'topologyIcon' | 'listIcon';
}> = function ({ title, description, link, linkLabel, iconName }) {
  return (
    <PageSection role="sk-heading">
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
        <Content>
          {title && <Title headingLevel="h1">{title}</Title>}
          {description && <Content component={ContentVariants.p} dangerouslySetInnerHTML={{ __html: description }} />}
        </Content>
        <Flex>
          <FlexItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem id="custom-element">
                  <SkUpdateDataButton />
                </ToolbarItem>
                {link && <ToolbarItem variant="separator" />}
                {link && linkLabel && (
                  <ToolbarItem>
                    <SkNavigationViewLink link={link} linkLabel={linkLabel} iconName={iconName} />
                  </ToolbarItem>
                )}
              </ToolbarContent>
            </Toolbar>
          </FlexItem>
        </Flex>
      </Flex>
    </PageSection>
  );
};

/** Subcomponent for rendering navigation */
const NavigationSection: FC<{ navigationComponent?: ReactElement }> = function ({ navigationComponent }) {
  return navigationComponent ? (
    <div>
      {navigationComponent}
      <Divider style={{ position: 'absolute', bottom: 0 }} />
    </div>
  ) : null;
};

/** Subcomponent for rendering the main content */
const ContentSection: FC<{
  contentChildren: ReactElement;
  hasPadding?: boolean;
}> = function ({ contentChildren, hasPadding }) {
  return (
    <PageSection hasBodyWrapper={false} padding={{ default: hasPadding ? 'noPadding' : 'padding' }} isFilled>
      <Suspense fallback={<LoadingPage />}>{contentChildren}</Suspense>
    </PageSection>
  );
};

const MainContainer: FC<MainContainerProps> = function ({
  dataTestId,
  title,
  link,
  linkLabel = TopologyLabels.TopologyView,
  iconName = 'topologyIcon',
  description,
  hasMainContentPadding = false,
  navigationComponent,
  mainContentChildren
}) {
  return (
    <TransitionPage>
      <PageGroup data-testid={dataTestId}>
        {title && (
          <HeaderSection
            title={title}
            description={description}
            link={link}
            linkLabel={linkLabel}
            iconName={iconName}
          />
        )}
        <NavigationSection navigationComponent={navigationComponent} />
        <ContentSection contentChildren={mainContentChildren} hasPadding={hasMainContentPadding} />
      </PageGroup>
    </TransitionPage>
  );
};

export default MainContainer;
