import { FC, useMemo, useState, useCallback, useRef, useEffect } from 'react';

import { Button, debounce } from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';

import { getDataFromSession, storeDataToSession } from '../../utils/persistData';
import SkSelect, { SkSelectOption } from '../SkSelect';

export const refreshDataIntervalMap: SkSelectOption[] = [
  {
    label: 'Refresh off',
    id: `${0}`
  },
  {
    label: '15s',
    id: `${15 * 1000}`
  },
  {
    label: '30s',
    id: `${30 * 1000}`
  },
  {
    label: '60s',
    id: `${60 * 1000}`
  },
  {
    label: '120s',
    id: `${120 * 1000}`
  }
];

const REFRESH_INTERVAL_KEY = 'refreshIntervalSelected';

interface SkUpdateDataButtonProps {
  isLoading?: boolean;
  onClick?: Function;
  onRefreshIntervalSelected?: Function;
  refreshIntervalDefault?: string;
}

const SkUpdateDataButton: FC<SkUpdateDataButtonProps> = function ({
  onClick,
  onRefreshIntervalSelected,
  refreshIntervalDefault
}) {
  const queryClient = useQueryClient();
  const fetchNumber = useIsFetching({
    type: 'active',
    fetchStatus: 'fetching',
    predicate: (query) => query.queryKey[0] !== 'QueriesGetUser' && query.queryKey[0] !== 'QueryLogout'
  });

  const [refreshIntervalSelected, setSelectIntervalSelected] = useState<string>(
    getDataFromSession(REFRESH_INTERVAL_KEY) || refreshIntervalDefault || `${refreshDataIntervalMap[0].id}`
  );

  const refreshIntervalId = useRef<number>();

  const revalidateLiveQueries = useCallback(() => {
    queryClient.invalidateQueries({
      refetchType: 'active',
      predicate: (query) => query.queryKey[0] !== 'QueriesGetUser' && query.queryKey[0] !== 'QueryLogout'
    });

    if (onClick) {
      onClick();
    }
  }, [onClick, queryClient]);

  const handleSelectRefreshInterval = useCallback(
    (selection: string | number | undefined) => {
      const refreshDataIntervalSelected = selection as string;

      setSelectIntervalSelected(refreshDataIntervalSelected);
      storeDataToSession('refreshIntervalSelected', refreshDataIntervalSelected);

      if (onRefreshIntervalSelected) {
        onRefreshIntervalSelected(findRefreshDataIntervalValueFromLabel(refreshDataIntervalSelected));
      }
    },
    [onRefreshIntervalSelected]
  );

  useEffect(() => {
    const refreshInterval = findRefreshDataIntervalValueFromLabel(refreshIntervalSelected);
    clearInterval(refreshIntervalId.current);

    if (refreshInterval) {
      refreshIntervalId.current = window.setInterval(() => {
        revalidateLiveQueries();
      }, refreshInterval);

      revalidateLiveQueries();
    }

    return () => clearInterval(refreshIntervalId.current);
  }, [refreshIntervalSelected, revalidateLiveQueries]);

  const isLoading = useMemo(() => fetchNumber > 0, [fetchNumber]);

  return (
    <div id="sk-update-data-button">
      <SkSelect
        selected={refreshIntervalSelected || refreshDataIntervalMap[0].id}
        items={refreshDataIntervalMap}
        onSelect={handleSelectRefreshInterval}
      />

      <Button
        key="split-action-primary"
        data-testid="update-data-click"
        onClick={debounce(revalidateLiveQueries, 750)}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        isLoading={isLoading}
      >
        <SyncIcon />
      </Button>
    </div>
  );
};

export default SkUpdateDataButton;

function findRefreshDataIntervalValueFromLabel(selected: string | undefined): number {
  return Number(refreshDataIntervalMap.find(({ id }) => id === selected)?.id || 0);
}
