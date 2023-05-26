import { useCallback, useRef } from 'react';

import { HighlightValueCellProps } from './HighightValueCell.interfaces';

const HighlightValueCell = function <T>({ value, format }: HighlightValueCellProps<T>) {
  const prevValueRef = useRef<number>();

  const isValueUpdated = useCallback(() => {
    if (!prevValueRef.current) {
      prevValueRef.current = value;

      return false;
    }

    if (value !== prevValueRef.current) {
      prevValueRef.current = value;

      return true;
    }

    return false;
  }, [value]);

  return isValueUpdated() ? (
    <div
      style={{
        fontWeight: 900,
        color: 'var(--pf-global--palette--blue-500)'
      }}
    >
      {format(value)}
    </div>
  ) : (
    format(value)
  );
};

export default HighlightValueCell;
