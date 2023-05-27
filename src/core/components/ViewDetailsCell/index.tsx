import { SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { ViewDetailCellProps } from './ViewDetailCell.interfaces';

const viewDetailCell = ({ link }: ViewDetailCellProps) => (
  <Link to={link}>
    <SearchIcon />
  </Link>
);

export default viewDetailCell;
