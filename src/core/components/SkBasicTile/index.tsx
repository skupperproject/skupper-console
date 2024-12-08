import { FC } from 'react';

import { Card, CardBody, Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';

import { styles } from '../../../config/styles';

interface SkBasicTileProps {
  title?: string;
  value: string | number;
  bgColor?: string;
  fontColor?: string;
}

const SkBasicTile: FC<SkBasicTileProps> = function ({
  title,
  value,
  bgColor = styles.default.darkBackgroundColor,
  fontColor = styles.default.lightTextColor
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
