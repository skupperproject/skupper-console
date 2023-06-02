import { useCallback } from 'react';

import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { ViewDetailCellProps } from './ViewDetailCell.interfaces';

const ViewDetailCell = function ({ value, onClick }: ViewDetailCellProps) {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [value, onClick]);

  return <Button variant="link" onClick={handleOnClick} icon={<SearchIcon />} />;
};

export default ViewDetailCell;
