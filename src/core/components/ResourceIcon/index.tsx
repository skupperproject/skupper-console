import React, { FC } from 'react';

import './ResourceIcon.scss';

interface ResourceIconProps {
    type: 'site' | 'deployment' | 'service';
}

const RESOURCE_MAP = {
    site: { class: 'sk-resource-site', symbol: 'S' },
    deployment: { class: 'sk-resource-deployment', symbol: 'D' },
    service: { class: 'sk-resource-service', symbol: 'S' },
};

const ResourceIcon: FC<ResourceIconProps> = function ({ type }) {
    return (
        <span className={`sk-resource-icon ${RESOURCE_MAP[type].class}`}>
            {RESOURCE_MAP[type].symbol}
        </span>
    );
};

export default ResourceIcon;
