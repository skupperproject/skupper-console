import { useCallback } from 'react';

import { SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { ViewDetailCellProps } from './ViewDetailCell.interface';

const ViewDetailCell = function ({ link, value, onClick }: ViewDetailCellProps) {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [value, onClick]);

  if (link) {
    return (
      <Link to={link}>
        <SearchIcon />
      </Link>
    );
  }

  return <SearchIcon onClick={handleOnClick} style={{ cursor: 'pointer' }} />;
};

export default ViewDetailCell;
