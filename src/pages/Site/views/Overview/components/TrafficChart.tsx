import React, { useEffect, useState } from 'react';

import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';

import { TotalBytesBySite } from '@pages/Site/services/services.interfaces';

import { chartConfig } from './TrafficChart.constants';
import { TrafficChartLabels } from './TrafficChart.enum';
import { SampleProps } from './TrafficChart.interfaces';

const TrafficChart = function ({
  totalBytesBySites,
  timestamp,
}: {
  totalBytesBySites: TotalBytesBySite[];
  timestamp: number;
}) {
  const [lastTimestamp, setLastTimestamp] = useState(timestamp);
  const [samples, setSamples] = useState<SampleProps[][] | null>(null);

  useEffect(() => {
    const lowerBoundTimestamp = Date.now() - chartConfig.timestampWindowUpperBound;
    const newSamplesBySite = totalBytesBySites.map(({ totalBytes, siteName }, index) => {
      const sample = {
        y: totalBytes,
        x: `${timestamp - lastTimestamp}`,
        name: siteName,
        timestamp,
      };

      const newSamples = [
        ...((samples && samples[index]) || [{ name: ' ', x: '0', y: 0, timestamp: 0 }]),
        sample,
      ];

      return newSamples.filter((newSample) => newSample.timestamp - lowerBoundTimestamp > 0);
    });

    setSamples(newSamplesBySite);
  }, [timestamp]);

  useEffect(() => {
    setLastTimestamp(Date.now());
  }, []);

  return (
    <div style={{ height: `${chartConfig.height}px`, width: `${chartConfig.width}px` }}>
      <Chart
        ariaDesc="byte sents for the selected site"
        ariaTitle="Byte sents"
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendData={[{ name: 'Bytes sent during the last minute' }]}
        legendOrientation="vertical"
        legendPosition="bottom"
        height={chartConfig.height}
        domainPadding={{ y: [10, 10] }}
        padding={{
          bottom: 70,
          left: 70,
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
              interpolation="natural"
              animate={{
                duration: 1000,
                onLoad: { duration: 1000 },
              }}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

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
