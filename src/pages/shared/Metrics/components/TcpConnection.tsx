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

import { Labels } from '../../../../config/labels';
import SkChartArea from '../../../../core/components/SkChartArea';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { formatNumber } from '../../../../core/utils/formatNumber';
import { QueryMetricsParams, QueriesMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

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
  openSections = true,
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
    queryFn: () => MetricsController.getConnections(selectedFilters),
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
    <Card isExpanded={isExpanded} aria-label={Labels.TcpConnections}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{Labels.TcpConnections}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        {/*display grid center the child SKEmptyData */}
        <CardBody style={{ minHeight: minChartHeight, display: 'grid' }}>
          {isLoading && <SkIsLoading />}

          {!isLoading && connections && (
            <>
              {isRefetching && <SkIsLoading />}
              <Flex direction={{ xl: 'row', default: 'column' }}>
                <FlexItem flex={{ default: 'flex_2' }}>
                  {connections.liveConnectionsSerie && (
                    <SkChartArea data={connections.liveConnectionsSerie} legendLabels={[`${Labels.OpenConnections}`]} />
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
                      <Title headingLevel="h1">{`${Labels.OpenConnections}: ${formatNumber(
                        connections.liveConnectionsCount
                      )}`}</Title>
                    </Bullseye>
                  </FlexItem>
                </Flex>
              </Flex>
            </>
          )}

          {!isLoading && !connections && (
            <SKEmptyData
              message={Labels.NoMetricFound}
              description={Labels.NoMetricFoundDescription}
              icon={SearchIcon}
            />
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default TcpConnection;
