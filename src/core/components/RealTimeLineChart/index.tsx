import React, { memo, useEffect, useState } from 'react';

import {
    Chart,
    ChartAxis,
    ChartGroup,
    ChartLine,
    ChartVoronoiContainer,
} from '@patternfly/react-charts';

import { formatTime } from '@core/utils/formatTime';

import { chartConfig } from './RealTimeLineChart.constants';
import { ChartThemeColors, TrafficChartLabels } from './RealTimeLineChart.enum';
import { SampleProps, RealTimeLineChartProps } from './RealTimeLineChart.interfaces';

const RealTimeLineChart = memo(function ({ data, timestamp, options }: RealTimeLineChartProps) {
    const [lastTimestamp, setLastTimestamp] = useState(timestamp);
    const [samples, setSamples] = useState<SampleProps[][] | null>(null);

    useEffect(() => {
        const lowerBoundTimestamp = timestamp - chartConfig.timestampWindowUpperBound;
        const newSamplesBySite = data.map(({ value, name }, index) => {
            const sample = {
                y: value,
                name,
                x: `${timestamp - lastTimestamp}`,
                timestamp,
            };

            const newSamples = [
                ...((samples && samples[index]) || [{ name: '.', x: '0', y: 0, timestamp: 0 }]),
                sample,
            ];

            return newSamples.filter((newSample) => newSample.timestamp - lowerBoundTimestamp > 0);
        });

        setSamples(newSamplesBySite);
    }, [timestamp]);

    useEffect(() => {
        setLastTimestamp(Date.now());
    }, []);

    if (!samples) {
        return null;
    }

    return (
        <div style={{ height: `${chartConfig.height}px` }}>
            <Chart
                containerComponent={
                    <ChartVoronoiContainer
                        labels={({ datum }) =>
                            `${datum.name}: ${
                                options?.formatter ? options.formatter(datum.y, 3) : datum.y
                            }`
                        }
                        constrainToVisibleArea
                    />
                }
                legendData={options?.dataLegend}
                legendOrientation="horizontal"
                legendPosition="bottom"
                legendAllowWrap={true}
                height={chartConfig.height}
                domainPadding={{ y: [10, 10] }}
                padding={{
                    bottom: 140,
                    left: 90,
                    right: 90,
                    top: 0,
                }}
                width={chartConfig.width}
                themeColor={options?.chartColor ? options.chartColor : ChartThemeColors.Blue}
            >
                <ChartAxis // X axis
                    tickFormat={(_, index, ticks) => {
                        if (index === ticks.length - 1) {
                            return TrafficChartLabels.TickFormatUpperBoundLabel;
                        }

                        if (index === 0) {
                            return Number(ticks[ticks.length - 1]) <=
                                chartConfig.timestampWindowUpperBound
                                ? `${formatTime(Math.floor(ticks[ticks.length - 1] / 1000), {
                                      startSize: 'sec',
                                  })} ${TrafficChartLabels.TickFormatLowerBoundLabel}`
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
                    tickFormat={(tick) =>
                        options?.formatter ? options?.formatter(tick, 3) : Math.ceil(tick)
                    }
                />
                <ChartGroup>
                    {samples?.map((sampleGroup: SampleProps[], index) => (
                        <ChartLine
                            key={index}
                            data={sampleGroup}
                            animate={{
                                duration: 0,
                                onLoad: { duration: 0 },
                            }}
                        />
                    ))}
                </ChartGroup>
            </Chart>
        </div>
    );
});

export default RealTimeLineChart;
