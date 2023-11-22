import { ChangeEvent, FC, MouseEvent, useCallback, useState } from 'react';

import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { useQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { ProcessGroupResponse, ProcessResponse, SiteResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesProcesses } from '@pages/Processes/Processes.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyLabels } from '../Topology.enum';

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const externalProcessesQueryParams = {
  processRole: 'external'
};

const remoteProcessesQueryParams = {
  processRole: 'remote'
};

const externalComponentQueryParams = {
  processGroupRole: 'external'
};

const remoteComponentQueryParams = {
  processGroupRole: 'remote'
};

const DisplayResource: FC<{
  id?: string;
  onSelect: Function;
  type?: 'process' | 'site' | 'component';
  placeholder?: string;
}> = function ({ id, type = 'process', placeholder = TopologyLabels.DisplayProcessesDefaultLabel, onSelect }) {
  const [isSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);

  const [
    { data: externalProcesses },
    { data: remoteProcesses },
    { data: sites },
    { data: externalComponents },
    { data: remoteComponents }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessResult, externalProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(externalProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL,
        enabled: type === 'process'
      },
      {
        queryKey: [QueriesProcesses.GetProcessResult, remoteProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(remoteProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL,
        enabled: type === 'process'
      },
      {
        queryKey: [QueriesSites.GetSites],
        queryFn: () => RESTApi.fetchSites(),
        refetchInterval: UPDATE_INTERVAL,
        enabled: type === 'site'
      },
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, externalComponentQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(externalComponentQueryParams),
        refetchInterval: UPDATE_INTERVAL,
        enabled: type === 'component'
      },
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, remoteComponentQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(remoteComponentQueryParams),
        refetchInterval: UPDATE_INTERVAL,
        enabled: type === 'component'
      }
    ]
  });

  function handleToggleMenu(openServiceMenu: boolean) {
    setIsServiceSelectMenuOpen(openServiceMenu);
  }

  function handleClear() {
    if (onSelect) {
      onSelect(undefined);
    }
  }

  function handleSelect(_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) {
    const currentSelected = selection as string;

    setIsServiceSelectMenuOpen(false);

    if (onSelect) {
      onSelect(currentSelected);
    }
  }

  function handleFind(_: ChangeEvent<HTMLInputElement> | null, value: string) {
    const options = getOptions();

    if (!value) {
      return options;
    }

    return options
      .filter((element) =>
        element.props.children
          ? element.props.children.toString().toLowerCase().includes(value.toLowerCase())
          : undefined
      )
      .filter(Boolean);
  }

  const getOptions = useCallback(() => {
    let resources = [] as ProcessResponse[] | SiteResponse[] | ProcessGroupResponse[];

    if (type === 'process') {
      resources = [...(externalProcesses || []), ...(remoteProcesses || [])];
    }
    if (type === 'site') {
      resources = sites || [];
    }

    if (type === 'component') {
      resources = [...(externalComponents?.results || []), ...(remoteComponents?.results || [])];
    }

    return resources.map(({ name, identity }, index) => (
      <SelectOption key={index + 1} value={identity}>
        {name}
      </SelectOption>
    ));
  }, [externalComponents?.results, remoteComponents?.results, externalProcesses, remoteProcesses, sites, type]);

  return (
    <Select
      role="process-select"
      isOpen={isSelectMenuOpen}
      placeholderText={placeholder}
      onSelect={handleSelect}
      onToggle={(_, isOpen) => handleToggleMenu(isOpen)}
      selections={id}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ProcessFilterPlaceholderText}
      onFilter={handleFind}
      maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
      onClear={handleClear}
    >
      {getOptions()}
    </Select>
  );
};

export default DisplayResource;
