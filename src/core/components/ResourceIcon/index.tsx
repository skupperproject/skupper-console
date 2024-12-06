import { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import skupperProcessSVG from '../../../assets/skupper.svg';
import { HexColors } from '../../../config/colors';

import './ResourceIcon.css';

const RESOURCE_MAP = {
  site: {
    symbol: 'S',
    style: { background: HexColors.Green500 }
  },
  component: {
    symbol: 'C',
    style: { background: HexColors.Teal500 }
  },
  service: {
    symbol: 'RK',
    style: { background: HexColors.Purple500 }
  },
  process: {
    symbol: 'P',
    style: { background: HexColors.Black500 }
  },
  skupper: {
    symbol: '',
    style: { background: 'transparent', marginLeft: '-5px', minWidth: '32px' }
  }
};

interface ResourceIconProps {
  type: 'site' | 'component' | 'service' | 'process' | 'skupper';
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
