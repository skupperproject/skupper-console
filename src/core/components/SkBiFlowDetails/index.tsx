import { FC } from 'react';

import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

import { Protocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import { formatLatency } from '@core/utils/formatLatency';
import { renderTraceBySites } from '@core/utils/renderTraceBySites';
import { TcpBiflow, FlowPairsResponse, HttpBiflow } from '@sk-types/REST.interfaces';

import { BiFlowLabels } from './BiFlow.enum';
import HttpFlowDetails from './HttpFlowDetails';
import TcpFlowDetails from './TcpFlowDetails';

interface BiFlowDetailsProp {
  biflow: FlowPairsResponse;
}

const BiFlowDetails: FC<BiFlowDetailsProp> = function ({ biflow }) {
  const { protocol, endTime: endTimeMicroSeconds, identity, traceSites, duration } = biflow;

  const hasHttp = protocol === Protocols.Http || protocol === Protocols.Http2;

  return (
    <Grid hasGutter data-testid={getTestsIds.flowPairsView(identity)}>
      <GridItem span={12}>
        <>
          <TextContent>
            <Text component={TextVariants.h2}>
              Connection {endTimeMicroSeconds ? BiFlowLabels.Closed : BiFlowLabels.Open}
            </Text>
          </TextContent>

          <Card isPlain>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  {renderTraceDetails(traceSites)}
                  {!!duration && renderDuration(duration)}
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </>

        {hasHttp && (
          <>
            <TextContent>
              <Text component={TextVariants.h2}>
                Request {endTimeMicroSeconds ? BiFlowLabels.Terminated : BiFlowLabels.Open}
              </Text>
            </TextContent>
            <Card isPlain>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    {renderProtocol(protocol)}
                    {renderTraceDetails(traceSites)}
                    {!!duration && renderDuration(duration)}
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </>
        )}
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

export default BiFlowDetails;

const renderDuration = (duration?: number) => {
  if (!duration) {
    return null;
  }

  return (
    <>
      <DescriptionListTerm>{BiFlowLabels.Duration}</DescriptionListTerm>
      <DescriptionListDescription>{formatLatency(duration)}</DescriptionListDescription>
    </>
  );
};

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
