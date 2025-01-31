import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Stack, StackItem } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import TrafficCharts from './TrafficCharts';
import { Labels } from '../../../../config/labels';
import { hexColors, styles } from '../../../../config/styles';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { QueriesMetrics, QueryMetricsParams } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

interface TrafficProps {
  selectedFilters: QueryMetricsParams;
  refetchInterval?: number;
}

const minChartHeight = 450;

const Traffic: FC<TrafficProps> = function ({ selectedFilters, refetchInterval }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, isRefetching, isLoading } = useQuery({
    queryKey: [QueriesMetrics.GetTraffic, selectedFilters],
    queryFn: () => MetricsController.getDataTraffic(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const dataClientAvailable =
    !!data?.trafficClient.txTimeSerie?.data.length && !!data?.trafficClient.rxTimeSerie?.data.length;
  const dataSeverAvailable =
    !!data?.trafficServer.txTimeSerie?.data.length && !!data?.trafficServer.rxTimeSerie?.data.length;

  const isOnlyClientOrServer = dataSeverAvailable && dataClientAvailable;

  return (
    <Card isExpanded={isExpanded} aria-label={Labels.TcpTraffic}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{Labels.TcpTraffic}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        {/*display grid center the child SKEmptyData */}
        <CardBody style={{ minHeight: minChartHeight, display: 'grid' }}>
          {isLoading && <SkIsLoading />}

          <Stack hasGutter>
            {(!!data?.traffic.txTimeSerie?.data.length || !!data?.traffic.rxTimeSerie?.data.length) && (
              <StackItem>
                {!isLoading && isRefetching && <SkIsLoading />}
                <TrafficCharts byteRateData={data.traffic} colorScale={[hexColors.Blue400, hexColors.Green500]} />
              </StackItem>
            )}
            {isOnlyClientOrServer &&
              (!!data?.trafficClient.txTimeSerie?.data.length || !!data?.trafficClient.rxTimeSerie?.data.length) && (
                <StackItem>
                  {!isLoading && isRefetching && <SkIsLoading />}
                  <br></br> <br></br> <br></br> <br></br>
                  <TrafficCharts
                    title={`${Labels.ByteRateDataOutDescription}`}
                    byteRateData={data.trafficClient}
                    colorScale={[hexColors.Orange100, styles.default.warningColor]}
                  />
                </StackItem>
              )}
            {isOnlyClientOrServer &&
              (!!data?.trafficServer.txTimeSerie?.data.length || !!data?.trafficServer.rxTimeSerie?.data.length) && (
                <StackItem>
                  {!isLoading && isRefetching && <SkIsLoading />}
                  <br></br> <br></br> <br></br> <br></br>
                  <TrafficCharts
                    title={`${Labels.ByteRateDataInDescription}`}
                    byteRateData={data.trafficServer}
                    colorScale={[hexColors.Purple100, hexColors.Purple500]}
                  />
                </StackItem>
              )}{' '}
          </Stack>

          {!isLoading && !data?.traffic.txTimeSerie?.data.length && !data?.traffic.rxTimeSerie?.data.length && (
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

export default Traffic;
