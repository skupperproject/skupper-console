import { FC } from 'react';

import { Card, CardBody, Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';

import { HexColors } from '../../../config/colors';

interface SkBasicTileProps {
  title?: string;
  value: string | number;
  bgColor?: string;
  fontColor?: string;
}

const SkBasicTile: FC<SkBasicTileProps> = function ({
  title,
  value,
  bgColor = HexColors.Black500,
  fontColor = HexColors.White
}) {
  return (
    <Card
      isPlain
      style={{
        backgroundColor: bgColor
      }}
    >
      <CardBody>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentCenter' }}
        >
          <FlexItem>
            <Content component={ContentVariants.p} style={{ color: fontColor }}>
              {title}
            </Content>
          </FlexItem>
          <FlexItem>
            <Content component={ContentVariants.h1} style={{ color: fontColor }}>
              {value}
            </Content>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default SkBasicTile;
