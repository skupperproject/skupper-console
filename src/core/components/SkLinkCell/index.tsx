import { Truncate } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

export interface SkLinkCellProps<T> {
  data: T;
  value: string | undefined;
  link: string;
  isDisabled?: boolean;
  type?: 'process' | 'site' | 'component' | 'service';
  fitContent?: boolean;
}

// Renders the value of the cell, either truncated or not depending on the fitContent prop
function renderValue(value: string, isDisabled: boolean, fitContent: boolean) {
  if (isDisabled) {
    return (
      <Truncate content={value} position={'middle'}>
        {value}
      </Truncate>
    );
  }

  return fitContent ? (
    value
  ) : (
    <Truncate content={value} position={'middle'}>
      {value}
    </Truncate>
  );
}

// A cell that contains a link to another page
const SkLinkCell = function <T>({ value, link, type, isDisabled = false, fitContent = false }: SkLinkCellProps<T>) {
  // If there is no value, display an empty string
  if (!value) {
    return '';
  }

  const stringValue = value.toString();

  return (
    <div style={{ display: 'flex' }}>
      {/* If a type is provided, display a corresponding icon */}
      {type && <ResourceIcon type={type} />}
      {/* If the cell is disabled, render the value without a link */}
      {isDisabled ? (
        renderValue(stringValue, isDisabled, fitContent)
      ) : (
        // Otherwise, render the value as a link
        <Link to={link}>{renderValue(stringValue, isDisabled, fitContent)}</Link>
      )}
    </div>
  );
};

export default SkLinkCell;
