import React, { FC } from 'react';

import { Title } from '@patternfly/react-core';

import { DescriptionItemProps } from '../Sites.interfaces';

const DescriptionItem: FC<DescriptionItemProps> = function ({ title, value }) {
    return (
        <div className="pf-u-mb-lg">
            <Title headingLevel="h4">{title}</Title>
            <span>{value}</span>
        </div>
    );
};

export default DescriptionItem;
