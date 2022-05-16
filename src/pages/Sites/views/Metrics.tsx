import React from 'react';

import { ChartPie } from '@patternfly/react-charts';
import { Card } from '@patternfly/react-core';

const SitesConnectionsPieChart = function () {
    return (
        <Card style={{ height: '230px', width: '350px' }}>
            <ChartPie
                ariaDesc="Average number of pets"
                ariaTitle="Pie chart example"
                constrainToVisibleArea={true}
                data={[
                    { x: 'Cats', y: 35 },
                    { x: 'Dogs', y: 55 },
                    { x: 'Birds', y: 10 },
                ]}
                height={230}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                legendData={[{ name: 'Cats: 35' }, { name: 'Dogs: 55' }, { name: 'Birds: 10' }]}
                legendOrientation="vertical"
                legendPosition="right"
                padding={{
                    bottom: 20,
                    left: 20,
                    right: 140, // Adjusted to accommodate legend
                    top: 20,
                }}
                width={350}
            />
        </Card>
    );
};

const SitesMetrics = function () {
    return <SitesConnectionsPieChart />;
};

export default SitesMetrics;
