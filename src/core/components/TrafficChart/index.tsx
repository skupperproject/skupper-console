import React, { memo, useEffect, useState } from 'react';

import {
    Chart,
    ChartAxis,
    ChartGroup,
    ChartLine,
    ChartVoronoiContainer,
} from '@patternfly/react-charts';

import { formatBytes } from '@core/utils/formatBytes';

import { chartConfig } from './TrafficChart.constants';
import { TrafficChartLabels } from './TrafficChart.enum';
import { SampleProps, TrafficChartProps } from './TrafficChart.interfaces';

const TrafficChart = memo(function ({ totalBytesProps, timestamp, options }: TrafficChartProps) {
    const [lastTimestamp, setLastTimestamp] = useState(timestamp);
    const [samples, setSamples] = useState<SampleProps[][] | null>(null);

    useEffect(() => {
        const lowerBoundTimestamp = timestamp - chartConfig.timestampWindowUpperBound;

        const newSamplesBySite = totalBytesProps.map(({ totalBytes, name }, index) => {
            const sample = {
                y: totalBytes,
                name,
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
    }, [timestamp]);

    useEffect(() => {
        setLastTimestamp(Date.now());
    }, []);

    return (
        <div style={{ height: `${chartConfig.height}px`, width: `${chartConfig.width}px` }}>
            <Chart
                containerComponent={
                    <ChartVoronoiContainer
                        labels={({ datum }) => `${datum.name}: ${formatBytes(datum.y)}`}
                        constrainToVisibleArea
                    />
                }
                legendData={options?.dataLegend}
                legendOrientation="horizontal"
                legendPosition="bottom"
                height={chartConfig.height}
                domainPadding={{ y: [10, 10] }}
                padding={{
                    bottom: 40,
                    left: 90,
                    right: 50,
                    top: 20,
                }}
                width={chartConfig.width}
                themeColor={options?.chartColor ? options.chartColor : 'blue'}
            >
                <ChartAxis // X axis
                    tickFormat={(_, index, ticks) => {
                        if (index === ticks.length - 1) {
                            return TrafficChartLabels.TickFormatUpperBoundLabel;
                        }
                        if (index === 0) {
                            return Number(ticks[ticks.length - 1]) <=
                                chartConfig.timestampWindowUpperBound
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
