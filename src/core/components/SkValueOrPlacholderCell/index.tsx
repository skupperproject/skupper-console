import { FC } from 'react';

import { Truncate } from '@patternfly/react-core';

import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';

export interface SkValueOrPlaceHolderCellProps {
  value: string | number | boolean | undefined;
}

const SkValueOrPlaceHolderCell: FC<SkValueOrPlaceHolderCellProps> = function ({ value }) {
  if (!value) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return (
    <Truncate content={value.toString()} position={'middle'}>
      {value}
    </Truncate>
  );
};

export default SkValueOrPlaceHolderCell;
