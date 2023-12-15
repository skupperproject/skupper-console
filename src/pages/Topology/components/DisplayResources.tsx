import { ChangeEvent, FC, MouseEvent, useMemo, useState } from 'react';

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
const FILTER_BY_SERVICE_MIN_WIDTH = 150;

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
  data?: { name: string; identity: string }[];
  onSelect: Function;
  type?: 'process' | 'site' | 'component';
  placeholder?: string;
}> = function ({ id, type = 'process', placeholder = TopologyLabels.DisplayProcessesDefaultLabel, onSelect, data }) {
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
        queryFn: () =>
          !data && type === 'process' ? RESTApi.fetchProcessesResult(externalProcessesQueryParams) : null,
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessResult, remoteProcessesQueryParams],
        queryFn: () => (!data && type === 'process' ? RESTApi.fetchProcessesResult(remoteProcessesQueryParams) : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesSites.GetSites],
        queryFn: () => (!data && type === 'site' ? RESTApi.fetchSites() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, externalComponentQueryParams],
        queryFn: () =>
          !data && type === 'component' ? RESTApi.fetchProcessGroups(externalComponentQueryParams) : null,
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, remoteComponentQueryParams],
        queryFn: () => (!data && type === 'component' ? RESTApi.fetchProcessGroups(remoteComponentQueryParams) : null),
        refetchInterval: UPDATE_INTERVAL
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
    const options = getOptions;

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

  const getOptions = useMemo(() => {
    let resources = [] as
      | ProcessResponse[]
      | SiteResponse[]
      | ProcessGroupResponse[]
      | { name: string; identity: string }[];

    if (type === 'process') {
      resources = data || [...(externalProcesses || []), ...(remoteProcesses || [])];
    }
    if (type === 'site') {
      resources = data || sites || [];
    }

    if (type === 'component') {
      resources = data || [...(externalComponents?.results || []), ...(remoteComponents?.results || [])];
    }

    return resources.map(({ name, identity }, index) => (
      <SelectOption key={index + 1} value={identity}>
        {name}
      </SelectOption>
    ));
  }, [data, type, externalProcesses, remoteProcesses, sites, externalComponents?.results, remoteComponents?.results]);

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
      style={{
        minWidth: `${FILTER_BY_SERVICE_MIN_WIDTH}px`,
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      onClear={handleClear}
    >
      {getOptions}
    </Select>
  );
};

export default DisplayResource;
