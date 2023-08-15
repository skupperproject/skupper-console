import { useCallback } from 'react';

import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { ViewDetailCellProps } from './ViewDetailCell.interface';

const ViewDetailCell = function <T>({ value, onClick }: ViewDetailCellProps<T>) {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [value, onClick]);

  return (
    <Button variant="plain" aria-label="Action" onClick={handleOnClick} title="Click details">
      <SearchIcon />
    </Button>
  );
};

export default ViewDetailCell;
