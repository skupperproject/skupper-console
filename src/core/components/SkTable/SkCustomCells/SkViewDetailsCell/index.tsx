import { useCallback } from 'react';

import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

interface SkViewDetailCellProps<T> {
  link?: string;
  value?: T;
  onClick?: Function;
}

const SkViewDetailCell = function <T>({ value, onClick }: SkViewDetailCellProps<T>) {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [value, onClick]);

  return (
    <Button icon={<SearchIcon />} variant="plain" aria-label="Action" onClick={handleOnClick} title="Click details" />
  );
};

export default SkViewDetailCell;
