import React, { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import './ResourceIcon.css';

interface ResourceIconProps {
    type: 'site' | 'deployment' | 'service' | 'address' | 'process';
}

const RESOURCE_MAP = {
    site: { class: 'sk-resource-site', symbol: 'S' },
    deployment: { class: 'sk-resource-deployment', symbol: 'D' },
    service: { class: 'sk-resource-service', symbol: 'SE' },
    address: { class: 'sk-resource-address', symbol: 'A' },
    process: { class: 'sk-resource-process', symbol: 'P' },
};

const ResourceIcon: FC<ResourceIconProps> = function ({ type }) {
    return (
        <Tooltip content={type}>
            <span className={`sk-resource-icon ${RESOURCE_MAP[type].class}`}>
                {RESOURCE_MAP[type].symbol}
            </span>
        </Tooltip>
    );
};

export default ResourceIcon;
