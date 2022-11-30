import React, { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import skupperProcessSVG from '@assets/skupper.svg';

import './ResourceIcon.css';

interface ResourceIconProps {
    type: 'site' | 'deployment' | 'service' | 'address' | 'process' | 'skupper';
}

const RESOURCE_MAP = {
    site: { class: 'sk-resource-site', symbol: 'S' },
    deployment: { class: 'sk-resource-deployment', symbol: 'D' },
    service: { class: 'sk-resource-process-group', symbol: 'C' },
    address: { class: 'sk-resource-address', symbol: 'A' },
    process: { class: 'sk-resource-process', symbol: 'P' },
    skupper: { class: 'sk-resource-skupper', symbol: '' },
};

const ResourceIcon: FC<ResourceIconProps> = function ({ type }) {
    return (
        <Tooltip content={type}>
            <span className={`sk-resource-icon ${RESOURCE_MAP[type].class}`}>
                {RESOURCE_MAP[type].symbol || <img src={skupperProcessSVG} alt="Skupper Icon" />}
            </span>
        </Tooltip>
    );
};

export default ResourceIcon;
