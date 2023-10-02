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

import { displayIntervalMap } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';

interface UpdateMetricsButtonProps {
  isLoading?: boolean;
  onClick: Function;
  onRefreshIntervalSelected: Function;
  refreshIntervalDefault?: string;
}

const UpdateMetricsButton: FC<UpdateMetricsButtonProps> = function ({
  isLoading,
  onClick,
  onRefreshIntervalSelected,
  refreshIntervalDefault
}) {
  const [isSelectOpen, setSelectOpen] = useState(false);
  const [refreshIntervalSelected, setSelectIntervalSelected] = useState<string | undefined>(refreshIntervalDefault);

  const refreshIntervalOptions = useMemo(
    () =>
      displayIntervalMap.map(({ label, key }, index) => (
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
        onRefreshIntervalSelected(refreshDataIntervalSelected);
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
                {!refreshIntervalSelected || refreshIntervalSelected === displayIntervalMap[0].key
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
