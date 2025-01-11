import { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import skupperProcessSVG from '../../../assets/skupper.svg';
import { hexColors } from '../../../config/styles';

import './ResourceIcon.css';

const RESOURCE_MAP = {
  site: {
    symbol: 'S',
    style: { background: hexColors.Green500 }
  },
  link: {
    symbol: 'L',
    style: { background: hexColors.Blue400 }
  },
  component: {
    symbol: 'C',
    style: { background: hexColors.Teal500 }
  },
  service: {
    symbol: 'RK',
    style: { background: hexColors.Purple500 }
  },
  process: {
    symbol: 'P',
    style: { background: hexColors.Black500 }
  },
  connector: {
    symbol: 'CN',
    style: { background: hexColors.Orange400 }
  },
  listener: {
    symbol: 'LS',
    style: { background: hexColors.Red500 }
  },
  skupper: {
    symbol: '',
    style: { background: 'transparent', marginLeft: '-5px', minWidth: '32px' }
  }
};

export interface ResourceIconProps {
  type: 'site' | 'link' | 'component' | 'service' | 'process' | 'connector' | 'listener' | 'skupper';
}

const ResourceIcon: FC<ResourceIconProps> = function ({ type }) {
  return (
    <Tooltip content={`resource type: ${type}`}>
      <span role={`${type}-resource-icon`} className={`sk-resource-icon`} style={RESOURCE_MAP[type].style}>
        {RESOURCE_MAP[type].symbol || <img src={skupperProcessSVG} alt={'Skupper Icon'} />}
      </span>
    </Tooltip>
  );
};

export default ResourceIcon;
