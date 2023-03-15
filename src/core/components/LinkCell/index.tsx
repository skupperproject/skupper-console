import React from 'react';

import { Tooltip } from '@patternfly/react-core';
import { TableText } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { LinkCellProps } from './LinkCell.interfaces';

const LinkCell = function <T>({ value, link, type, isDisabled = false }: LinkCellProps<T>) {
  return (
    <Tooltip content={value}>
      <TableText wrapModifier="truncate">
        {type && <ResourceIcon type={type} />}
        {isDisabled && value}
        {!isDisabled && <Link to={link}>{value}</Link>}
      </TableText>
    </Tooltip>
  );
};

export default LinkCell;
