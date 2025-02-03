import { Link } from 'react-router-dom';

import { EMPTY_VALUE_SYMBOL } from '../../../../../config/app';
import ResourceIcon, { ResourceIconProps } from '../../../ResourceIcon';

export interface SkLinkCellProps<T> {
  data: T;
  value: string | undefined;
  link: string;
  type?: ResourceIconProps['type'];
}

// A reusable table cell component that displays a link and an optional resource icon.
const SkLinkCell = function <T>({ value, link, type }: SkLinkCellProps<T>) {
  // Display a placeholder if no value is provided
  if (!value) {
    return EMPTY_VALUE_SYMBOL;
  }

  return (
    <div style={{ display: 'flex' }} data-testid={`${value}`}>
      {type && <ResourceIcon type={type} />}
      {link ? <Link to={link} style={{ textDecoration: 'none' }}>{`${value}`}</Link> : `${value}`}
    </div>
  );
};

export default SkLinkCell;
