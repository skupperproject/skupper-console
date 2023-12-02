import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Button } from '@patternfly/react-core';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core/deprecated';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesServices } from '@pages/Services/Services.enum';

import { TopologyLabels } from '../Topology.enum';

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const DisplayServices: FC<{
  serviceIds?: string[];
  onSelect: Function;
}> = function ({ serviceIds, onSelect }) {
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[]>([]);
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

  function handleSelectAllServices() {
    const areAllServicesSelected = serviceIdsSelected.length === services?.results.length;
    const newSelectedOptions = areAllServicesSelected
      ? []
      : (services?.results || []).map(({ identity }) => identity).sort();

    setServiceIdsSelected(newSelectedOptions);

    if (onSelect) {
      onSelect(areAllServicesSelected ? [] : undefined);
    }
  }

  function handleSelectService(_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) {
    const currentSelected = selection as string;

    const isSelected = currentSelected ? serviceIdsSelected.includes(currentSelected) : undefined;
    const newSelectedOptions = isSelected
      ? // remove display option
        serviceIdsSelected?.filter((option) => option !== currentSelected).sort()
      : // add display option
        [...(serviceIdsSelected || []), currentSelected].sort();

    const areAllServicesSelected = newSelectedOptions.length === services?.results.length;
    setServiceIdsSelected(areAllServicesSelected ? [] : newSelectedOptions);

    if (onSelect) {
      onSelect(areAllServicesSelected ? undefined : newSelectedOptions);
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
    if (serviceIds) {
      setServiceIdsSelected(serviceIds);

      return;
    }

    if (!serviceIdsSelected.length && services?.results) {
      setServiceIdsSelected(services?.results.map(({ identity }) => identity) || []);
    }
  }, [serviceIds, serviceIdsSelected, services?.results]);

  return (
    <Select
      role="service-select"
      variant={SelectVariant.checkbox}
      isOpen={isServiceSelectMenuOpen}
      placeholderText={TopologyLabels.DisplayServicesDefaultLabel}
      onSelect={handleSelectService}
      onToggle={(_, isOpen) => handleToggleServiceMenu(isOpen)}
      selections={serviceIdsSelected}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ServiceFilterPlaceholderText}
      onFilter={handleFindServices}
      maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
      isCheckboxSelectionBadgeHidden
      footer={
        <Button variant="link" isInline onClick={handleSelectAllServices}>
          {serviceIdsSelected.length === services?.results.length
            ? TopologyLabels.DeselectAll
            : TopologyLabels.SelectAll}
        </Button>
      }
    >
      {getOptions()}
    </Select>
  );
};

export default DisplayServices;
