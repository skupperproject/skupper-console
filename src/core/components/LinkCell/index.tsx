import { Truncate } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { LinkCellProps } from './LinkCell.interfaces';

const LinkCell = function <T>({ value, link, type, isDisabled = false, fitContent }: LinkCellProps<T>) {
  return (
    <div style={{ display: 'flex' }}>
      {type && <ResourceIcon type={type} />}
      {isDisabled && (
        <Truncate content={value} position={'middle'}>
          {value}
        </Truncate>
      )}
      {!isDisabled && (
        <Link to={link}>
          {fitContent ? (
            value
          ) : (
            <Truncate content={value} position={'middle'}>
              {value}
            </Truncate>
          )}
        </Link>
      )}
    </div>
  );
};

export default LinkCell;
