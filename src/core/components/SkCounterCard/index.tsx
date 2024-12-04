import { FC } from 'react';

import { Card, CardBody, TextContent, TextVariants, Text, Flex } from '@patternfly/react-core';

import { Colors } from '../../../config/colors';

interface SkCounterCardProps {
  title?: string;
  value: string | number;
  bgColor?: string;
  fontColor?: string;
}

const SkCounterCard: FC<SkCounterCardProps> = function ({
  title,
  value,
  bgColor = Colors.Black500,
  fontColor = Colors.White
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
          <TextContent style={{ color: `var(${fontColor})` }}>
            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
              <Text component={TextVariants.p} style={{ margin: 0 }}>
                {title}
              </Text>
              <Text component={TextVariants.h1} style={{ margin: 0 }}>
                {value}
              </Text>
            </Flex>
          </TextContent>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default SkCounterCard;
