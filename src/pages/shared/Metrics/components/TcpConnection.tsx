import { FC, useCallback, useEffect, useState } from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { AvailableProtocols } from '@API/REST.enum';
import { isPrometheusActive } from '@config/config';
import SkChartArea from '@core/components/SkChartArea';
import SkIsLoading from '@core/components/SkIsLoading';
import { formatNumber } from '@core/utils/formatNumber';

import { MetricsLabels } from '../Metrics.enum';
import { SelectedMetricFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface TcpConnectionProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const TcpConnection: FC<TcpConnectionProps> = function ({
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const {
    data: connections,
    refetch,
    isRefetching
  } = useQuery(
    [QueriesMetrics.GetConnection, selectedFilters],
    () => MetricsController.getConnections({ ...selectedFilters, protocol: AvailableProtocols.Tcp }),
    {
      refetchInterval,
      keepPreviousData: true
    }
  );

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ connection: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    isPrometheusActive && refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  if (!connections) {
    return null;
  }

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.ConnectionTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody>
          {isRefetching && <SkIsLoading />}
          <Flex direction={{ xl: 'row', md: 'column' }}>
            <FlexItem flex={{ default: 'flex_2' }}>
              {connections.liveConnectionsSerie && <SkChartArea data={connections.liveConnectionsSerie} />}
            </FlexItem>

            <Divider orientation={{ default: 'vertical' }} />

            <FlexItem flex={{ default: 'flex_1' }}>
              <Flex
                flex={{ default: 'flex_1' }}
                direction={{ default: 'column' }}
                alignItems={{ default: 'alignItemsCenter' }}
                alignSelf={{ default: 'alignSelfStretch' }}
              >
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Bullseye>
                    <Title headingLevel="h1">{`${MetricsLabels.LiveConnections}: ${formatNumber(
                      connections.liveConnectionsCount
                    )}`}</Title>
                  </Bullseye>
                </FlexItem>

                <Divider orientation={{ default: 'horizontal' }} />

                <FlexItem>
                  <Bullseye>
                    <Title headingLevel="h1">{`${MetricsLabels.TerminatedConnections}: ${formatNumber(
                      connections.terminatedConnectionsCount
                    )}`}</Title>
                  </Bullseye>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default TcpConnection;
