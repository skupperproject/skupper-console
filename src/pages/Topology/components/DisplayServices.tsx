import { ChangeEvent, FC, MouseEvent, useCallback, useState } from 'react';

import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesServices } from '@pages/Services/Services.enum';

import { TopologyLabels } from '../Topology.enum';

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const DisplayServices: FC<{
  serviceId?: string;
  onSelect: Function;
}> = function ({ serviceId, onSelect }) {
  const [serviceIdSelected, setServiceIdSelected] = useState(serviceId);
  const [isServiceSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);

  const { data: services } = useQuery({
    queryKey: [QueriesServices.GetServices],
    queryFn: () => RESTApi.fetchServices(),
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
  });

  function handleToggleServiceMenu(openServiceMenu: boolean) {
    setIsServiceSelectMenuOpen(openServiceMenu);
  }

  function handleSelectService(
    _: MouseEvent | ChangeEvent,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as string);

    setServiceIdSelected(id);
    setIsServiceSelectMenuOpen(false);

    if (onSelect) {
      onSelect(id);
    }
  }

  function handleFindServices(_: ChangeEvent<HTMLInputElement> | null, value: string) {
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
    const options = (services?.results || []).map(({ name, identity }, index) => (
      <SelectOption key={index + 1} value={identity}>
        {name}
      </SelectOption>
    ));

    const optionsWithDefault = [
      <SelectOption key={0} value={TopologyLabels.ShowAll} isPlaceholder />,
      ...(options || [])
    ];

    return optionsWithDefault;
  }, [services?.results]);

  return (
    <Select
      role="service-select"
      isOpen={isServiceSelectMenuOpen}
      onSelect={handleSelectService}
      onToggle={(_, isOpen) => handleToggleServiceMenu(isOpen)}
      selections={serviceIdSelected}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ServiceFilterPlaceholderText}
      onFilter={handleFindServices}
      maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
    >
      {getOptions()}
    </Select>
  );
};

export default DisplayServices;
