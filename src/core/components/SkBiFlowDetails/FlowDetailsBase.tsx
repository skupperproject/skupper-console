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

import { BiFlowLabels } from './BiFlow.enum';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../config/config';
import { ProcessesRoutesPaths } from '../../../pages/Processes/Processes.enum';
import { formatBytes } from '../../utils/formatBytes';
import { formatLatency } from '../../utils/formatLatency';
import ResourceIcon from '../ResourceIcon';

interface FlowDetailsBaseProps {
  title: string;
  processName: string;
  processId: string | number;
  octets: number;
  latency?: number;
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

            {latency !== undefined && <DescriptionListTerm>{BiFlowLabels.Latency}</DescriptionListTerm>}
            {latency !== undefined && (
              <DescriptionListDescription>
                {formatLatency(latency) || EMPTY_VALUE_PLACEHOLDER}
              </DescriptionListDescription>
            )}

            {additionalDetails}
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default FlowDetailsBase;
