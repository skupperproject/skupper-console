import React, { FC, useCallback, useState } from 'react';

import { ChartPie } from '@patternfly/react-charts';

import EmptyData from '@core/components/EmptyData';

import { ProcessesBytesChartProps } from '../Processes.interfaces';

const CHART_HEIGHT = 350;
const CHART_PADDING = {
    bottom: 20,
    left: 20,
    right: 200,
    top: 20,
};

const ProcessesBytesChart: FC<ProcessesBytesChartProps> = function ({ bytes, labels, ...props }) {
    const [chartContainerDimension, setChartContainerDimension] = useState({ width: 0 });

    const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const dimensions = node?.getBoundingClientRect();
            setChartContainerDimension({ width: dimensions.width });
        }
    }, []);

    return (
        <div ref={chartContainerRef} style={{ height: `${CHART_HEIGHT}px`, width: `100%` }}>
            {!bytes.length && <EmptyData />}
            {bytes.length && (
                <ChartPie
                    data={bytes}
                    labels={labels?.map(({ name }) => name)}
                    legendData={labels}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={CHART_PADDING}
                    width={chartContainerDimension.width}
                    height={CHART_HEIGHT}
                    {...props}
                />
            )}
        </div>
    );
};

export default ProcessesBytesChart;
