import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import TrafficCharts from './TrafficCharts';
import { HexColors } from '../../../../config/colors';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { QueriesMetrics, QueryMetricsParams } from '../../../../types/Metrics.interfaces';
import { MetricsLabels } from '../Metrics.enum';
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
    <Card isExpanded={isExpanded} aria-label={MetricsLabels.DataTransferTitle}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.DataTransferTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight }}>
          {isLoading && <SkIsLoading />}

          {(!!data?.traffic.txTimeSerie?.data.length || !!data?.traffic.rxTimeSerie?.data.length) && (
            <>
              {!isLoading && isRefetching && <SkIsLoading />}
              <Title headingLevel="h4">{`${MetricsLabels.ByteRateTitle}`} </Title>
              <TrafficCharts byteRateData={data.traffic} />
            </>
          )}

          {isOnlyClientOrServer &&
            (!!data?.trafficClient.txTimeSerie?.data.length || !!data?.trafficClient.rxTimeSerie?.data.length) && (
              <>
                {!isLoading && isRefetching && <SkIsLoading />}
                <Title headingLevel="h4">{`${MetricsLabels.ByteRateTitle} as Client`} </Title>
                <small>{MetricsLabels.ByteRateDataSentDescription} </small>
                <TrafficCharts
                  byteRateData={data.trafficClient}
                  colorScale={[HexColors.Orange100, HexColors.Orange400]}
                />
              </>
            )}

          {isOnlyClientOrServer &&
            (!!data?.trafficServer.txTimeSerie?.data.length || !!data?.trafficServer.rxTimeSerie?.data.length) && (
              <>
                {!isLoading && isRefetching && <SkIsLoading />}
                <Title headingLevel="h4">{`${MetricsLabels.ByteRateTitle} as Server`} </Title>
                <small>{MetricsLabels.ByteRateDataReceivedDescription} </small>
                <TrafficCharts
                  byteRateData={data.trafficServer}
                  colorScale={[HexColors.Purple100, HexColors.Purple400]}
                />
              </>
            )}

          {!isLoading && !data?.traffic.txTimeSerie?.data.length && !data?.traffic.rxTimeSerie?.data.length && (
            <SKEmptyData
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

export default Traffic;
