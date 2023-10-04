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

import { refreshDataIntervalMap } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';

interface UpdateMetricsButtonProps {
  isLoading?: boolean;
  onClick: Function;
  onRefreshIntervalSelected: Function;
  refreshIntervalDefault?: number;
}

const UpdateMetricsButton: FC<UpdateMetricsButtonProps> = function ({
  isLoading,
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

  return (
    <Dropdown
      isOpen={isSelectOpen}
      onSelect={handleSelectRefreshInterval}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid="update-metric-dropdown"
          className={isLoading ? 'button-toggle-dropdown-loading' : ''}
          ref={toggleRef}
          variant="primary"
          onClick={() => setSelectOpen(!isSelectOpen)}
          isExpanded={isSelectOpen}
          splitButtonOptions={{
            variant: 'action',
            items: [
              <MenuToggleAction
                className={isLoading ? 'button-toggle-button-loading' : ''}
                id="split-button-action-primary-example-with-toggle-button"
                key="split-action-primary"
                data-testid="update-metric-click"
                onClick={() => onClick()}
              >
                {isLoading ? <Spinner isInline className="button-toggle-spinner" /> : <SyncIcon />}
                <span className="button-toggle-spinner-text">{MetricsLabels.RefetchData}</span>{' '}
                {!refreshIntervalSelected || refreshIntervalSelected === refreshDataIntervalMap[0].key
                  ? ' '
                  : refreshIntervalSelected}
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

export default UpdateMetricsButton;

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
