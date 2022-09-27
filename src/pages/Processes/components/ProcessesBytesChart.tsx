import React, { FC, useEffect, useRef, useState } from 'react';

import { ChartPie } from '@patternfly/react-charts';

import { ProcessesBytesChartProps } from '../Processes.interfaces';

const CHART_HEIGHT = 350;
const CHART_PADDING = {
    bottom: 20,
    left: 20,
    right: 200,
    top: 20,
};

const ProcessesBytesChart: FC<ProcessesBytesChartProps> = function ({ bytes, labels, ...props }) {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    const [chartContainerDimension, setChartContainerDimension] = useState({ width: 0 });

    useEffect(() => {
        if (chartContainerRef.current) {
            const dimensions = chartContainerRef.current.getBoundingClientRect();
            setChartContainerDimension({ width: dimensions.width });
        }
    }, []);

    return (
        <div ref={chartContainerRef} style={{ height: `${CHART_HEIGHT}px`, width: `100%` }}>
            <ChartPie
                constrainToVisibleArea
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
        </div>
    );
};

export default ProcessesBytesChart;
