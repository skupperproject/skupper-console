import { useMemo, useRef } from 'react';

import { VarColors } from '../../../config/colors';

export interface SkHighlightValueCellProps<T> {
  data: T;
  value: number;
  format: Function;
}

const SkHighlightValueCell = function <T>({ value, format }: SkHighlightValueCellProps<T>) {
  const prevValueRef = useRef<number>();

  const isValueUpdated = useMemo(() => {
    if (!prevValueRef.current) {
      prevValueRef.current = value;

      return false;
    }

    if (format(value) !== format(prevValueRef.current)) {
      prevValueRef.current = value;

      return true;
    }

    return false;
  }, [format, value]);

  return isValueUpdated ? (
    <div
      data-testid="highlighted-value"
      style={{
        fontWeight: 900,
        color: VarColors.Green500
      }}
    >
      {format(value)}
    </div>
  ) : (
    format(value)
  );
};

export default SkHighlightValueCell;
