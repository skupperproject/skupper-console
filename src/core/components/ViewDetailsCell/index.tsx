import { useCallback } from 'react';

import { SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { ViewDetailCellProps } from './ViewDetailCell.interfaces';

const ViewDetailCell = function ({ link, value, onClick }: ViewDetailCellProps) {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [value, onClick]);

  return (
    <Link to={link || ''} onClick={handleOnClick}>
      <SearchIcon />
    </Link>
  );
};

export default ViewDetailCell;
