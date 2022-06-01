import React, { FC } from 'react';

import { DescriptionItemProps } from './DescriptionItem.interfaces';

const DescriptionItem: FC<DescriptionItemProps> = function ({ title, value }) {
    return (
        <div className="pf-u-mb-lg">
            <div className="  pf-u-font-weight-bold">{title}</div>
            <span>{value}</span>
        </div>
    );
};

export default DescriptionItem;
