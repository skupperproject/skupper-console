import { FC } from 'react';

import { ChartArea, ChartGroup, ChartThemeColor, ChartVoronoiContainer } from '@patternfly/react-charts';
import { Card, CardBody, CardFooter, TextContent, TextVariants, Text, Flex } from '@patternfly/react-core';

import { MetricCardProps } from './SkCounterCart.interfaces';

const SkCounterCard: FC<MetricCardProps> = function ({
  title,
  value,
  bgColor = '--pf-v5-global--palette--black-400',
  fontColor = '--pf-v5-global--palette--white',
  showChart = true,
  colorChart = ChartThemeColor.blue,
  dataChart
}) {
  return (
    <Card
      isPlain
      style={{
        backgroundColor: `var(${bgColor})`
      }}
    >
      <CardBody>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }}>
          <TextContent style={{ color: `var(${fontColor})` }} className="pf-v5-u-text-align-center">
            <Text component={TextVariants.p} style={{ margin: 0 }}>
              {title}
            </Text>
            <Text component={TextVariants.h1} style={{ margin: 0 }}>
              {value}
            </Text>
          </TextContent>
        </Flex>
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

export default SkCounterCard;
