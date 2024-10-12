import { FC, ReactNode } from 'react';

import {
  Card,
  CardTitle,
  Title,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon
} from '@patternfly/react-core';
import { LaptopIcon, ServerIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { BiFlowLabels } from './BiFlow.enum';

interface FlowDetailsBaseProps {
  title: string;
  processName: string;
  processId: string | number;
  octets: number;
  latency: number;
  isCounterflow?: boolean;
  additionalDetails?: ReactNode; // for any flow-specific details like HTTP method, status, etc.
}

const FlowDetailsBase: FC<FlowDetailsBaseProps> = function ({
  title,
  processName,
  processId,
  octets,
  latency,
  isCounterflow = false,
  additionalDetails
}) {
  return (
    <Card isFullHeight isPlain>
      <CardTitle>
        <Title headingLevel="h2">
          <Icon isInline size="md">
            {isCounterflow ? <ServerIcon /> : <LaptopIcon />}
          </Icon>
          {'  '}
          {title}
        </Title>
      </CardTitle>
      <CardBody>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{BiFlowLabels.Process}</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                <ResourceIcon type="process" />
                <Link to={`${ProcessesRoutesPaths.Processes}/${processName}@${processId}`}>{processName}</Link>
              </>
            </DescriptionListDescription>

            <DescriptionListTerm>{BiFlowLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(octets) || EMPTY_VALUE_PLACEHOLDER}</DescriptionListDescription>

            <DescriptionListTerm>{BiFlowLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(latency) || EMPTY_VALUE_PLACEHOLDER}</DescriptionListDescription>

            {additionalDetails}
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default FlowDetailsBase;
