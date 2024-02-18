import { FC, useMemo, MouseEvent as ReactMouseEvent, useState, useCallback, Ref } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
  Spinner
} from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';

import './SkUpdateDataButton.css';

interface SkUpdateDataButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: Function;
  onRefreshIntervalSelected: Function;
  refreshIntervalDefault?: number;
}

const REFETCH_DATA_LABEL = 'Fetch';
export const refreshDataIntervalMap = [
  {
    key: 'pause',
    value: 0,
    label: 'Off'
  },
  {
    key: '20s',
    value: 20 * 1000,
    label: '20s'
  },
  {
    key: '40s',
    value: 40 * 1000,
    label: '40s'
  },
  {
    key: '60s',
    value: 60 * 1000,
    label: '1m'
  },
  {
    key: '120s',
    value: 120 * 1000,
    label: '2m'
  }
];

const SkUpdateDataButton: FC<SkUpdateDataButtonProps> = function ({
  isLoading = false,
  isDisabled = false,
  onClick,
  onRefreshIntervalSelected,
  refreshIntervalDefault
}) {
  const [isSelectOpen, setSelectOpen] = useState(false);
  const [refreshIntervalSelected, setSelectIntervalSelected] = useState<string | undefined>(
    findRefreshDataIntervalLabelFromValue(refreshIntervalDefault)
  );

  const refreshIntervalOptions = useMemo(
    () =>
      refreshDataIntervalMap.map(({ label, key }, index) => (
        <DropdownItem key={index} value={key}>
          {label}
        </DropdownItem>
      )),
    []
  );

  const handleSelectRefreshInterval = useCallback(
    (_event: ReactMouseEvent<Element, MouseEvent> | undefined, selection: string | number | undefined) => {
      const refreshDataIntervalSelected = selection as string;

      setSelectIntervalSelected(refreshDataIntervalSelected);
      setSelectOpen(false);

      if (onRefreshIntervalSelected) {
        onRefreshIntervalSelected(findRefreshDataIntervalValueFromLabel(refreshDataIntervalSelected));
      }
    },
    [onRefreshIntervalSelected]
  );

  const isRefreshIntervalSelected =
    !refreshIntervalSelected || refreshIntervalSelected === refreshDataIntervalMap[0].key;

  return (
    <Dropdown
      isOpen={isSelectOpen}
      onSelect={handleSelectRefreshInterval}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isDisabled={isDisabled}
          data-testid="update-data-dropdown"
          className={isLoading ? 'button-toggle-dropdown-loading' : ''}
          ref={toggleRef}
          variant="primary"
          onClick={() => setSelectOpen(!isSelectOpen)}
          isExpanded={isSelectOpen}
          splitButtonOptions={{
            variant: 'action',
            items: [
              <MenuToggleAction
                className={getDropdownClassName({ isLoading, isDisabled })}
                key="split-action-primary"
                data-testid="update-data-click"
                onClick={() => onClick()}
              >
                {isLoading ? <Spinner isInline className="button-toggle-spinner" /> : <SyncIcon />}
                <span className="button-toggle-spinner-text">{REFETCH_DATA_LABEL}</span>{' '}
                {isRefreshIntervalSelected ? ' ' : refreshIntervalSelected}
              </MenuToggleAction>
            ]
          }}
        />
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>{refreshIntervalOptions}</DropdownList>
    </Dropdown>
  );
};

export default SkUpdateDataButton;

function findRefreshDataIntervalValueFromLabel(value: string | undefined): number {
  return refreshDataIntervalMap.find(({ key }) => key === value)?.value || 0;
}

function findRefreshDataIntervalLabelFromValue(valueSelected: number | undefined) {
  return (
    // value !== refreshDataIntervalMap[0].value. We don't want to show the label "off" when we select this value from the button
    refreshDataIntervalMap.find(({ value }) => value === valueSelected && value !== refreshDataIntervalMap[0].value)
      ?.label || ''
  );
}

function getDropdownClassName({ isLoading, isDisabled }: { isLoading: boolean; isDisabled: boolean }) {
  let dropdownClassName = '';

  if (isLoading) {
    dropdownClassName = 'button-toggle-loading';
  }

  if (isDisabled) {
    dropdownClassName = 'button-toggle-off';
  }

  return dropdownClassName;
}
