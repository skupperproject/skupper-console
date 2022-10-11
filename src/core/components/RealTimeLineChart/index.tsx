import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

const TOTAL_Y_AXIS_TICKS = 5;
const defaultSample = [{ name: '.', x: '0', y: 0, timestamp: 0 }];

const RealTimeLineChart = function ({ data, options }: RealTimeLineChartProps) {
    const [timestamp, setSampleTimestamp] = useState(new Date().getTime());
    const [samples, setSamples] = useState<SampleProps[][] | null>(null);
    const [containerDimension, setContainerDimension] = useState({ width: 0, height: 0 });

    const lastTimestamp = useMemo(() => new Date().getTime(), []);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const { width, height } = node.getBoundingClientRect();
            setContainerDimension({ width, height });
        }
    }, []);

    useEffect(() => {
        const lowerBoundTimestamp = timestamp - chartConfig.timestampWindowUpperBound;

        const newSamplesWindow = (prevSamples: SampleProps[][] | null) =>
            data.map(({ value, name }, index) => {
                const sample = {
                    y: value,
                    name,
                    x: `${timestamp - lastTimestamp}`,
                    timestamp,
                };

                const newSamples = [
                    ...((prevSamples && prevSamples[index]) || defaultSample),
                    sample,
                ];

                return newSamples.filter(
                    ({ timestamp: newTimestamp }) => newTimestamp - lowerBoundTimestamp > 0,
                );
            });

        setSamples(newSamplesWindow);
    }, [timestamp]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSampleTimestamp(new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!samples) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{ height: `${options?.height || chartConfig.height}px`, width: '100%' }}
        >
            <Chart
                containerComponent={
                    <ChartVoronoiContainer
                        labels={({ datum: { name, y } }) =>
                            `${name}: ${options?.formatter ? options.formatter(y, 2) : y}`
                        }
                        constrainToVisibleArea
                    />
                }
                legendData={options?.dataLegend}
                legendOrientation="horizontal"
                legendPosition="bottom"
                legendAllowWrap={true}
                height={containerDimension.height}
                width={containerDimension.width}
                domainPadding={{ y: [10, 10] }}
                padding={
                    options?.padding || {
                        bottom: 250,
                        left: 90,
                        right: 20,
                        top: 0,
                    }
                }
                themeColor={options?.chartColor ? options.chartColor : ChartThemeColors.Blue}
                colorScale={options?.colorScale}
            >
                <ChartAxis // X axis
                    showGrid
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
                    tickValues={getYAxisTickValues(samples)}
                    tickFormat={(tick) =>
                        options?.formatter ? options?.formatter(tick, 2) : Math.ceil(tick)
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
};

export default RealTimeLineChart;

function getYAxisTickValues(newSamples: SampleProps[][]) {
    const tickValuesBounds = newSamples.reduce((acc, sample) => {
        const sampleYValues = sample.map(({ y }) => y);

        acc.max = Math.max(acc.max || 0, ...sampleYValues);
        acc.min = Math.min(acc.min || 0, ...sampleYValues);

        return acc;
    }, {} as Record<string, number>);

    const tickValuesRange = tickValuesBounds.max - tickValuesBounds.min;

    if (tickValuesRange === 0) {
        return [0];
    }
    const deltaTick = tickValuesRange / TOTAL_Y_AXIS_TICKS;

    const ticks = [...Array(TOTAL_Y_AXIS_TICKS).keys()].map((index) =>
        Math.round(deltaTick * index + tickValuesBounds.min),
    );

    return [...ticks, tickValuesBounds.max];
}
