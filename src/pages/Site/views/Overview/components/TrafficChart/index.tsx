import React, { memo, useEffect, useState } from 'react';

import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import EmptyStateSpinner from '@core/components/EmptyStateSpinner';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import { SitesServices } from '@pages/Site/services';
import { QuerySite } from '@pages/Site/site.enum';
import { UPDATE_INTERVAL } from 'config';

import { chartConfig } from './TrafficChart.constants';
import { TrafficChartLabels } from './TrafficChart.enum';
import { SampleProps, TrafficChartProps } from './TrafficChart.interfaces';

const TrafficChart = memo(function ({
  totalBytes: totalBytesBySites,
  timestamp,
}: TrafficChartProps) {
  const [lastTimestamp, setLastTimestamp] = useState(timestamp);
  const [samples, setSamples] = useState<SampleProps[][] | null>(null);

  const navigate = useNavigate();

  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const {
    data: deploymentLinks,
    isLoading,
    dataUpdatedAt,
  } = useQuery(QuerySite.GetDeploymentLinks, SitesServices.fetchDeploymentLinks, {
    refetchInterval,
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  useEffect(() => {
    if (deploymentLinks) {
      const lowerBoundTimestamp = timestamp - chartConfig.timestampWindowUpperBound;

      const newSamplesBySite = totalBytesBySites.map((totalBytes, index) => {
        const sample = {
          y: totalBytes,
          x: `${timestamp - lastTimestamp}`,
          timestamp,
        };

        const newSamples = [
          ...((samples && samples[index]) || [{ name: ' ', x: '0', y: 0, timestamp: 0 }]),
          sample,
        ];

        return newSamples.filter((newSample) => newSample.timestamp - lowerBoundTimestamp > 0);
      });

      setSamples(newSamplesBySite);
    }
  }, [totalBytesBySites, dataUpdatedAt]);

  useEffect(() => {
    setLastTimestamp(Date.now());
  }, []);

  if (isLoading) {
    return <EmptyStateSpinner />;
  }

  if (!deploymentLinks) {
    return null;
  }

  return (
    <div style={{ height: `${chartConfig.height}px`, width: `${chartConfig.width}px` }}>
      <Chart
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendData={[{ name: 'Traffic during the last minute' }]}
        legendOrientation="vertical"
        legendPosition="bottom"
        height={chartConfig.height}
        domainPadding={{ y: [10, 10] }}
        padding={{
          bottom: 70,
          left: 90,
          right: 50,
          top: 20,
        }}
        width={chartConfig.width}
      >
        <ChartAxis // X axis
          tickFormat={(_, index, ticks) => {
            // first one
            if (index === ticks.length - 1) {
              return TrafficChartLabels.TickFormatUpperBoundLabel;
            }
            // last one.
            // After X seconds, it stops to show the calculated time from now (i.e., 25 secs ago). Instead, it shows a default label (i.e., 1 min ago)
            if (index === 0) {
              return Number(ticks[ticks.length - 1]) <= chartConfig.timestampWindowUpperBound
                ? `${Math.floor(ticks[ticks.length - 1] / 1000)} ${
                    TrafficChartLabels.TickFormatLowerBoundLabel
                  }`
                : TrafficChartLabels.TickFormatLowerBoundLabelOverflow;
            }

            return '';
          }}
        />
        <ChartAxis // y axis
          showGrid
          dependentAxis
          fixLabelOverlap={true}
          style={{
            tickLabels: { fontSize: 12 },
          }}
          tickFormat={(tick) => formatBytes(tick)}
        />
        <ChartGroup>
          {samples?.map((sampleGroup: SampleProps[], index) => (
            <ChartLine
              key={index}
              data={sampleGroup}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
              }}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
});

export default TrafficChart;

/**
 *  Converts input bytes in the most appropriate format
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
