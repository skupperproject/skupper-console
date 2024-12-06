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
  mainContentChildren?: ReactElement;
}

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
          <PageSection hasBodyWrapper={false} role="sk-heading">
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
            >
              <Content>
                <Title headingLevel="h1">{title}</Title>
                {description && (
                  <Content component={ContentVariants.p} dangerouslySetInnerHTML={{ __html: description }} />
                )}
              </Content>
              <Flex>
                <FlexItem>
                  <Toolbar style={{ padding: 0 }}>
                    <ToolbarContent style={{ padding: 0 }}>
                      <ToolbarItem id="custom-element">
                        <SkUpdateDataButton />
                      </ToolbarItem>
                      {link && <ToolbarItem variant="separator" />}
                      {link && (
                        <ToolbarItem>
                          {<SkNavigationViewLink link={link} linkLabel={linkLabel} iconName={iconName} />}
                        </ToolbarItem>
                      )}
                    </ToolbarContent>
                  </Toolbar>
                </FlexItem>
              </Flex>
            </Flex>
          </PageSection>
        )}

        {navigationComponent && (
          <>
            <Flex>{navigationComponent}</Flex>

            <Divider />
          </>
        )}
        {mainContentChildren && (
          <PageSection
            hasBodyWrapper={false}
            padding={{ default: hasMainContentPadding ? 'noPadding' : 'padding' }}
            isFilled={true}
          >
            <Suspense fallback={<LoadingPage />}>{mainContentChildren} </Suspense>
          </PageSection>
        )}
      </PageGroup>
    </TransitionPage>
  );
};

export default MainContainer;
