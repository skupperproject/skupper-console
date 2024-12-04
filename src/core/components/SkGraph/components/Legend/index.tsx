import { Divider, Flex, FlexItem, Title } from '@patternfly/react-core';

import SvgCircle from './Shapes/Circle';
import SvgDiamond from './Shapes/Diamond';
import SvgHorizontalLine from './Shapes/HorizontalLine';
import SvgSquare from './Shapes/Square';
import { PATTERNFLY_VERSION } from '../../../../../config/config';

enum Labels {
  EntitiesTitle = ' Entities',
  LinksTitle = ' Links',
  Exposed = 'Process, component or site exposed',
  NoExposed = 'Process/Component',
  SiteGroup = 'Related site grouping',
  Remote = 'Remote process/component',
  DataLink = 'Data flow link',
  ActiveDataLink = 'Active data link',
  SiteLink = 'Site link connected'
}

const ProcessLegend = function () {
  return (
    <>
      <Title headingLevel="h3" className={`pf-${PATTERNFLY_VERSION}-u-my-sm`}>
        {Labels.EntitiesTitle}
      </Title>

      <Flex className={`pf-${PATTERNFLY_VERSION}-u-mb-md pf-${PATTERNFLY_VERSION}-u-mx-md"`}>
        <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <SvgCircle />
          </FlexItem>

          <FlexItem>
            <SvgDiamond />
          </FlexItem>

          <FlexItem>
            <SvgSquare />
          </FlexItem>

          <FlexItem>
            <SvgCircle dimension={8} fillOpacity={1} />
          </FlexItem>
        </Flex>

        <Flex direction={{ default: 'column' }}>
          <FlexItem>{Labels.Exposed}</FlexItem>
          <FlexItem>{Labels.NoExposed}</FlexItem>
          <FlexItem>{Labels.SiteGroup}</FlexItem>
          <FlexItem>{Labels.Remote}</FlexItem>
        </Flex>
      </Flex>

      <Divider />
      <Title headingLevel="h3" className={`pf-${PATTERNFLY_VERSION}-u-my-sm`}>
        {Labels.LinksTitle}
      </Title>

      <Flex className={`pf-${PATTERNFLY_VERSION}-u-mb-md pf-${PATTERNFLY_VERSION}-u-mx-md`}>
        <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <SvgHorizontalLine />
          </FlexItem>

          <FlexItem>
            <SvgHorizontalLine dashed withConnector />
          </FlexItem>
        </Flex>

        <Flex direction={{ default: 'column' }}>
          <FlexItem>{Labels.DataLink}</FlexItem>
          <FlexItem>{Labels.SiteLink}</FlexItem>
        </Flex>
      </Flex>
    </>
  );
};

export default ProcessLegend;
