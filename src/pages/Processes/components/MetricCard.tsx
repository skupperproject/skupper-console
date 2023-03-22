import React, { FC } from 'react';

import { ChartArea, ChartGroup, ChartThemeColor, ChartVoronoiContainer } from '@patternfly/react-charts';
import { Bullseye, Card, CardBody, CardFooter, Title } from '@patternfly/react-core';

import { MetricCardProps } from '../Processes.interfaces';

const MetricCard: FC<MetricCardProps> = function ({
  title,
  value,
  bgColor = '--pf-global--palette--black-400',
  fontColor = 'white',
  showChart = true,
  colorChart = ChartThemeColor.blue,
  dataChart
}) {
  return (
    <Card
      isRounded
      isFullHeight
      style={{
        backgroundColor: `var(${bgColor})`,
        color: fontColor
      }}
    >
      <CardBody>
        <Title headingLevel="h3">{title}</Title>
        <Bullseye>
          <Title style={{ fontSize: '50px' }} headingLevel="h1">
            {value}
          </Title>
        </Bullseye>
      </CardBody>
      {showChart && !!dataChart && (
        <CardFooter>
          <MetricChart color={colorChart} data={dataChart} />
        </CardFooter>
      )}
    </Card>
  );
};

const MetricChart = function ({ data, color }: { data: { x: number | string; y: number }[]; color: string }) {
  return (
    <div style={{ height: '100px', width: '100%' }}>
      <ChartGroup
        height={100}
        padding={0}
        themeColor={color}
        domainPadding={{ x: [0, 20], y: [0, 0] }}
        containerComponent={<ChartVoronoiContainer labels={({ datum }) => datum.y} />}
      >
        <ChartArea data={data} interpolation="step" />
      </ChartGroup>
    </div>
  );
};

export default MetricCard;
