import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
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
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const minChartHeight = 450;

const Traffic: FC<TrafficProps> = function ({
  selectedFilters,
  forceUpdate,
  refetchInterval,
  openSections = true,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: [QueriesMetrics.GetTraffic, selectedFilters],
    queryFn: () => MetricsController.getDataTraffic(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ byterate: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  const handleRefetchMetrics = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

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
        <CardBody style={{ minHeight: minChartHeight }}>
          {isLoading && <SkIsLoading />}

          {(!!data?.traffic.txTimeSerie?.data.length || !!data?.traffic.rxTimeSerie?.data.length) && (
            <>
              {!isLoading && isRefetching && <SkIsLoading />}
              <Title headingLevel="h4">{`${Labels.ByteRate}`} </Title>
              <TrafficCharts byteRateData={data.traffic} />
            </>
          )}

          {isOnlyClientOrServer &&
            (!!data?.trafficClient.txTimeSerie?.data.length || !!data?.trafficClient.rxTimeSerie?.data.length) && (
              <>
                {!isLoading && isRefetching && <SkIsLoading />}
                <Title headingLevel="h4">{`${Labels.ByteRate} as Client`} </Title>
                <small>{Labels.ByteRateDataOutDescription} </small>
                <TrafficCharts
                  byteRateData={data.trafficClient}
                  colorScale={[hexColors.Orange100, styles.default.warningColor]}
                />
              </>
            )}

          {isOnlyClientOrServer &&
            (!!data?.trafficServer.txTimeSerie?.data.length || !!data?.trafficServer.rxTimeSerie?.data.length) && (
              <>
                {!isLoading && isRefetching && <SkIsLoading />}
                <Title headingLevel="h4">{`${Labels.ByteRate} as Server`} </Title>
                <small>{Labels.ByteRateDataInDescription} </small>
                <TrafficCharts
                  byteRateData={data.trafficServer}
                  colorScale={[hexColors.Purple100, hexColors.Purple500]}
                />
              </>
            )}

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
