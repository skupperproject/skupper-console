import React from 'react';

import { Flex, Text, TextContent, TextVariants, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const SectionTitle = function ({ title, description }: { title: string; description?: string }) {
  return (
    <Flex className="pf-u-py-md">
      <TextContent>
        <Text component={TextVariants.h1}>{title}</Text>
      </TextContent>
      {description && (
        <Tooltip position="right" content={description}>
          <OutlinedQuestionCircleIcon />
        </Tooltip>
      )}
    </Flex>
  );
};

export default SectionTitle;
