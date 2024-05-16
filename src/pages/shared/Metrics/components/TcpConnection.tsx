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
import { SearchIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { AvailableProtocols } from '@API/REST.enum';
import EmptyData from '@core/components/EmptyData';
import SkChartArea from '@core/components/SkChartArea';
import SkIsLoading from '@core/components/SkIsLoading';
import { formatNumber } from '@core/utils/formatNumber';

import { MetricsLabels } from '../Metrics.enum';
import { QueryMetricsParams, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface TcpConnectionProps {
  selectedFilters: QueryMetricsParams;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const minChartHeight = 340;

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
    isRefetching,
    isLoading
  } = useQuery({
    queryKey: [QueriesMetrics.GetConnection, selectedFilters],
    queryFn: () => MetricsController.getConnections({ ...selectedFilters, protocol: AvailableProtocols.Tcp }),
    refetchInterval,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ connection: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.ConnectionTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight }}>
          {isLoading && <SkIsLoading />}

          {!isLoading && connections && (
            <>
              {isRefetching && <SkIsLoading />}
              <Flex direction={{ xl: 'row', md: 'column' }}>
                <FlexItem flex={{ default: 'flex_2' }}>
                  {connections.liveConnectionsSerie && (
                    <>
                      <Title headingLevel="h4">{MetricsLabels.LiveConnectionsChartLabel} </Title>
                      <SkChartArea data={connections.liveConnectionsSerie} legendLabels={['open connections']} />
                    </>
                  )}
                </FlexItem>

                <Divider orientation={{ default: 'vertical' }} />

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
                </Flex>
              </Flex>
            </>
          )}

          {!isLoading && !connections && (
            <EmptyData
              message={MetricsLabels.NoMetricFoundTitleMessage}
              description={MetricsLabels.NoMetricFoundDescriptionMessage}
              icon={SearchIcon}
            />
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default TcpConnection;
