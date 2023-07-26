import { Divider, Flex, FlexItem, Text, TextContent, TextVariants, Title } from '@patternfly/react-core';

import { EDGE_COLOR_ACTIVE_DEFAULT } from './Graph.constants';
import SvgCircle from './Shapes/Circle';
import SvgDiamond from './Shapes/Diamond';
import SvgHorizontalLine from './Shapes/HorizontalLine';
import SvgSquare from './Shapes/Square';

enum Labels {
  EntitiesTitle = ' Entities',
  LinksTitle = ' Links',
  Exposed = 'Process, Component or Site exposed',
  NoExposed = 'Process/Component',
  SiteGroup = 'Related site grouping',
  Remote = 'Server process or component',
  DataLink = 'Data link',
  ActiveDataLink = 'Active data link',
  SiteLink = 'Site link'
}

const ProcessLegend = function () {
  return (
    <>
      <Title headingLevel="h3" className="pf-u-my-sm ">
        {Labels.EntitiesTitle}
      </Title>
      <Flex>
        <Flex className="pf-u-mx-md" direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem className="pf-u-mb-0">
            <SvgCircle />
          </FlexItem>

          <FlexItem className="pf-u-mb-0">
            <SvgDiamond />
          </FlexItem>

          <FlexItem className="pf-u-mb-0">
            <SvgSquare />
          </FlexItem>

          <FlexItem className="pf-u-mb-0">
            <SvgCircle dimension={8} />
          </FlexItem>
        </Flex>
        <Flex className="pf-u-mb-md ">
          <TextContent>
            <FlexItem>
              <Text component={TextVariants.small}>{Labels.Exposed}</Text>
            </FlexItem>

            <FlexItem>
              <Text component={TextVariants.small}>{Labels.NoExposed}</Text>
            </FlexItem>

            <FlexItem>
              <Text component={TextVariants.small}>{Labels.SiteGroup}</Text>
            </FlexItem>

            <FlexItem>
              <Text component={TextVariants.small}>{Labels.Remote}</Text>
            </FlexItem>
          </TextContent>
        </Flex>

        <Divider />

        <Title headingLevel="h3" className="pf-u-mt-md ">
          {Labels.LinksTitle}
        </Title>
      </Flex>
      <Flex>
        <Flex className="pf-u-mx-md" direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem className="pf-u-mb-0">
            <SvgHorizontalLine />
          </FlexItem>

          <FlexItem className="pf-u-mb-0">
            <SvgHorizontalLine color={EDGE_COLOR_ACTIVE_DEFAULT} />
          </FlexItem>

          <FlexItem className="pf-u-mb-0">
            <SvgHorizontalLine dashed />
          </FlexItem>
        </Flex>
        <Flex>
          <TextContent>
            <FlexItem>
              <Text component={TextVariants.small}>{Labels.DataLink}</Text>
            </FlexItem>

            <FlexItem>
              <Text component={TextVariants.small}>{Labels.ActiveDataLink}</Text>
            </FlexItem>

            <FlexItem>
              <Text component={TextVariants.small}>{Labels.SiteLink}</Text>
            </FlexItem>
          </TextContent>
        </Flex>
      </Flex>
    </>
  );
};

export default ProcessLegend;
