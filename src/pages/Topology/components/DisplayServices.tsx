import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core/deprecated';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesServices } from '@pages/Services/Services.enum';

import { TopologyLabels } from '../Topology.enum';

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const DisplayServices: FC<{
  serviceId?: string[];
  onSelect: Function;
}> = function ({ serviceId, onSelect }) {
  const [serviceIdSelected, setServiceIdSelected] = useState<string[]>([]);
  const [isServiceSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);

  const { data: services } = useQuery({
    queryKey: [QueriesServices.GetServices],
    queryFn: () => RESTApi.fetchServices(),
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
  });

  const addDisplayOptionToSelection = useCallback(
    (selected: string) => [...(serviceIdSelected || []), selected],
    [serviceIdSelected]
  );

  const removeDisplayOptionToSelection = useCallback(
    (selected: string) => serviceIdSelected?.filter((option) => option !== selected),
    [serviceIdSelected]
  );

  function handleToggleServiceMenu(openServiceMenu: boolean) {
    setIsServiceSelectMenuOpen(openServiceMenu);
  }

  function handleSelectService(_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) {
    const currentSelected = selection as string;

    const isSelected = currentSelected ? serviceIdSelected.includes(currentSelected) : undefined;

    const newSelectedOptions = isSelected
      ? removeDisplayOptionToSelection(currentSelected)
      : addDisplayOptionToSelection(currentSelected);

    setServiceIdSelected(newSelectedOptions);

    if (onSelect) {
      onSelect(newSelectedOptions);
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

  const getOptions = useCallback(
    () =>
      (services?.results || []).map(({ name, identity }, index) => (
        <SelectOption key={index + 1} value={identity}>
          {name}
        </SelectOption>
      )),
    [services?.results]
  );

  useEffect(() => {
    if (serviceId?.length) {
      setServiceIdSelected(serviceId);
    } else if (!serviceId?.length) {
      setServiceIdSelected(services?.results.map(({ identity }) => identity) || []);
    }
  }, [serviceId, services?.results]);

  return (
    <Select
      role="service-select"
      variant={SelectVariant.checkbox}
      isOpen={isServiceSelectMenuOpen}
      placeholderText={TopologyLabels.ShowAll}
      onSelect={handleSelectService}
      onToggle={(_, isOpen) => handleToggleServiceMenu(isOpen)}
      selections={serviceIdSelected}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ServiceFilterPlaceholderText}
      onFilter={handleFindServices}
      maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
      isCheckboxSelectionBadgeHidden
    >
      {getOptions()}
    </Select>
  );
};

export default DisplayServices;
