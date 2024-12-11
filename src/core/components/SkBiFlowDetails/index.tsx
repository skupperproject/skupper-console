import { FC } from 'react';

import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Grid,
  GridItem
} from '@patternfly/react-core';

import { BiFlowLabels } from './BiFlow.enum';
import HttpFlowDetails from './HttpFlowDetails';
import TcpFlowDetails from './TcpFlowDetails';
import { Protocols } from '../../../API/REST.enum';
import { getTestsIds } from '../../../config/testIds';
import { TransportFlowResponse, BiFlowResponse, ApplicationFlowResponse } from '../../../types/REST.interfaces';
import { formatLatency } from '../../utils/formatLatency';
import { renderTraceBySites } from '../../utils/renderTraceBySites';

interface SkBiFlowDetailsProp {
  biflow: BiFlowResponse;
}

const SkBiFlowDetails: FC<SkBiFlowDetailsProp> = function ({ biflow }) {
  const { protocol, endTime: endTimeMicroSeconds, identity, traceSites, duration } = biflow;

  const isHttp = protocol === Protocols.Http || protocol === Protocols.Http2;
  const isTcp = protocol === Protocols.Tcp;

  return (
    <Card>
      <CardBody>
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

          <Divider />

          <GridItem span={6}>
            {protocol === Protocols.Tcp ? (
              <TcpFlowDetails title={BiFlowLabels.Client} flow={biflow as TransportFlowResponse} />
            ) : (
              <HttpFlowDetails title={BiFlowLabels.Client} flow={biflow as ApplicationFlowResponse} />
            )}
          </GridItem>

          <GridItem span={6}>
            {protocol === Protocols.Tcp ? (
              <TcpFlowDetails title={BiFlowLabels.Server} flow={biflow as TransportFlowResponse} isCounterflow={true} />
            ) : (
              <HttpFlowDetails
                title={BiFlowLabels.Server}
                flow={biflow as ApplicationFlowResponse}
                isCounterflow={true}
              />
            )}
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
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
