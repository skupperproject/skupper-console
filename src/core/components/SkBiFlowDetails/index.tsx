import { FC } from 'react';

import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem
} from '@patternfly/react-core';

import { Protocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import { formatLatency } from '@core/utils/formatLatency';
import { renderTraceBySites } from '@core/utils/renderTraceBySites';
import { TcpBiflow, BiFlowResponse, HttpBiflow } from '@sk-types/REST.interfaces';

import { BiFlowLabels } from './BiFlow.enum';
import HttpFlowDetails from './HttpFlowDetails';
import TcpFlowDetails from './TcpFlowDetails';

interface SkBiFlowDetailsProp {
  biflow: BiFlowResponse;
}

const SkBiFlowDetails: FC<SkBiFlowDetailsProp> = function ({ biflow }) {
  const { protocol, endTime: endTimeMicroSeconds, identity, traceSites, duration } = biflow;

  const isHttp = protocol === Protocols.Http || protocol === Protocols.Http2;
  const isTcp = protocol === Protocols.Tcp;

  return (
    <Grid hasGutter data-testid={getTestsIds.biFlowView(identity)}>
      <GridItem span={12}>
        <Card isPlain>
          <CardBody>
            <DescriptionList>
              <DescriptionListGroup>
                {isTcp && sessionState(endTimeMicroSeconds ? BiFlowLabels.Closed : BiFlowLabels.Open)}
                {isHttp && sessionState(endTimeMicroSeconds ? BiFlowLabels.Terminated : BiFlowLabels.Open)}
                {renderProtocol(protocol)}
                {renderTraceDetails(traceSites)}
                {!!duration && renderDuration(duration)}
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem span={6}>
        {protocol === Protocols.Tcp ? (
          <TcpFlowDetails title={BiFlowLabels.Client} flow={biflow as TcpBiflow} />
        ) : (
          <HttpFlowDetails title={BiFlowLabels.Client} flow={biflow as HttpBiflow} />
        )}
      </GridItem>
      <GridItem span={6}>
        {protocol === Protocols.Tcp ? (
          <TcpFlowDetails title={BiFlowLabels.Server} flow={biflow as TcpBiflow} isCounterflow={true} />
        ) : (
          <HttpFlowDetails title={BiFlowLabels.Server} flow={biflow as HttpBiflow} isCounterflow={true} />
        )}
      </GridItem>
    </Grid>
  );
};

export default SkBiFlowDetails;

const sessionState = (state: BiFlowLabels.Terminated | BiFlowLabels.Closed | BiFlowLabels.Open) => (
  <>
    <DescriptionListTerm>{BiFlowLabels.State}</DescriptionListTerm>
    <DescriptionListDescription>{state}</DescriptionListDescription>
  </>
);

const renderDuration = (duration: number) => (
  <>
    <DescriptionListTerm>{BiFlowLabels.Duration}</DescriptionListTerm>
    <DescriptionListDescription>{formatLatency(duration)}</DescriptionListDescription>
  </>
);

const renderTraceDetails = (traceSites: string[]) => (
  <>
    <DescriptionListTerm>{BiFlowLabels.Trace}</DescriptionListTerm>
    <DescriptionListDescription>{renderTraceBySites(traceSites)}</DescriptionListDescription>
  </>
);

const renderProtocol = (protocol: Protocols) => (
  <>
    <DescriptionListTerm>{BiFlowLabels.Protocol}</DescriptionListTerm>
    <DescriptionListDescription>{protocol}</DescriptionListDescription>
  </>
);
