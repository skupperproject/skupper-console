import { useCallback } from 'react';

import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { ViewDetailCellProps } from './ViewDetailCell.interfaces';

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

  return <Button variant="link" onClick={handleOnClick} icon={<SearchIcon />} />;
};

export default ViewDetailCell;
