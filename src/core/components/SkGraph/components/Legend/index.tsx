import { Content, Divider, Flex, FlexItem, Panel, PanelHeader, PanelMainBody, Title } from '@patternfly/react-core';

import SvgCircle from './Shapes/Circle';
import SvgDiamond from './Shapes/Diamond';
import SvgHorizontalLine from './Shapes/HorizontalLine';
import SvgSquare from './Shapes/Square';

enum Labels {
  EntitiesTitle = ' Entities',
  LinksTitle = ' Links',
  Exposed = 'Bound',
  NoExposed = 'Unbound',
  SiteGroup = 'Grouping',
  Remote = 'Remote resource',
  DataLink = 'Data link',
  SiteLink = 'Router link'
}

const ProcessLegend = function () {
  return (
    <>
      <Panel>
        <PanelHeader>
          <Title headingLevel="h4">{Labels.EntitiesTitle}</Title>
        </PanelHeader>

        <PanelMainBody>
          <Flex>
            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Content>
                  <SvgCircle />
                </Content>
              </FlexItem>

              <FlexItem>
                <Content>
                  <SvgDiamond />
                </Content>
              </FlexItem>

              <FlexItem>
                <Content>
                  <SvgSquare />
                </Content>
              </FlexItem>

              <FlexItem>
                <Content>
                  <SvgCircle dimension={8} fillOpacity={1} />
                </Content>
              </FlexItem>
            </Flex>

            <Flex direction={{ default: 'column' }}>
              <FlexItem>
                <Content>{Labels.Exposed}</Content>
              </FlexItem>
              <FlexItem>
                <Content>{Labels.NoExposed}</Content>
              </FlexItem>
              <FlexItem>
                <Content>{Labels.SiteGroup}</Content>
              </FlexItem>
              <FlexItem>
                <Content>{Labels.Remote}</Content>
              </FlexItem>
            </Flex>
          </Flex>
        </PanelMainBody>
      </Panel>

      <Divider />

      <Panel>
        <PanelHeader>
          <Title headingLevel="h4">{Labels.LinksTitle}</Title>
        </PanelHeader>

        <PanelMainBody>
          <Flex>
            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Content>
                  <SvgHorizontalLine />
                </Content>
              </FlexItem>

              <FlexItem>
                <Content>
                  <SvgHorizontalLine dashed />
                </Content>
              </FlexItem>
            </Flex>

            <Flex direction={{ default: 'column' }}>
              <FlexItem>
                <Content>{Labels.DataLink}</Content>
              </FlexItem>
              <FlexItem>
                <Content>{Labels.SiteLink}</Content>
              </FlexItem>
            </Flex>
          </Flex>
        </PanelMainBody>
      </Panel>
    </>
  );
};

export default ProcessLegend;
