import React, { FC } from 'react';

import { TextContent, Text, TextVariants, Bullseye } from '@patternfly/react-core';

import { EmptyDataLabels } from './EmptyData.enum';
import { EmptyDataProps } from './EmptyData.interfaces';

const EmptyData: FC<EmptyDataProps> = function ({ message = EmptyDataLabels.Default }) {
    return (
        <Bullseye>
            <TextContent>
                <Text component={TextVariants.p} className="pf-u-color-400">
                    {message}
                </Text>
            </TextContent>
        </Bullseye>
    );
};

export default EmptyData;
