import { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import skupperProcessSVG from '@assets/skupper.svg';

import './ResourceIcon.css';

const RESOURCE_MAP = {
  site: { class: 'sk-resource-site', symbol: 'S' },
  component: { class: 'sk-resource-process-group', symbol: 'C' },
  service: { class: 'sk-resource-service', symbol: 'SE' },
  process: { class: 'sk-resource-process', symbol: 'P' },
  skupper: { class: 'sk-resource-skupper', symbol: '' }
};

interface ResourceIconProps {
  type: 'site' | 'component' | 'service' | 'process' | 'skupper';
}

const ResourceIcon: FC<ResourceIconProps> = function ({ type }) {
  return (
    <Tooltip content={`resource type: ${type}`}>
      <span role={`${type}-resource-icon`} className={`sk-resource-icon ${RESOURCE_MAP[type].class}`}>
        {RESOURCE_MAP[type].symbol || <img src={skupperProcessSVG} alt={'Skupper Icon'} />}
      </span>
    </Tooltip>
  );
};

export default ResourceIcon;
