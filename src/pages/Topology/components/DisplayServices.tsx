import { FC, useCallback, useState } from 'react';

import { Button } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesServices } from '@pages/Services/Services.enum';

import { TopologyLabels } from '../Topology.enum';

interface ServiceOption {
  key: string;
  value: string;
  label: string;
}

interface DisplayServicesProps {
  initialIdsSelected?: string[];
  onSelected: (items: string[] | undefined) => void;
}

interface DisplayServicesContentProps {
  initialIdsSelected: string[];
  options: ServiceOption[];
  onSelected: (items: string[] | undefined) => void;
}

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

export const useServiceSelection = ({ initialIdsSelected, options, onSelected }: DisplayServicesContentProps) => {
  const [serviceIdsSelected, setServiceIdsSelected] = useState(initialIdsSelected);
  const [isServiceSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);

  const toggleServiceMenu = (isOpen: boolean) => {
    setIsServiceSelectMenuOpen(isOpen);
  };

  const selectService = useCallback(
    (selection: string) => {
      // Determine the new set of selected service IDs:
      // - If the service is already selected, remove it
      // - If not, add it to the selection
      const newSelected = serviceIdsSelected.includes(selection)
        ? serviceIdsSelected.filter((id) => id !== selection)
        : [...serviceIdsSelected, selection];

      setServiceIdsSelected(newSelected);
      onSelected(newSelected);
    },
    [serviceIdsSelected, onSelected]
  );

  const selectAllServices = useCallback(() => {
    const allServicesSelected = serviceIdsSelected.length === options.length;

    // Set the new selected services to either:
    // - An empty array if all were previously selected (deselecting everything)
    // - A sorted array of all service IDs if not all were selected (selecting everything)
    const updatedSelecteServices =
      serviceIdsSelected.length === options.length ? [] : options.map(({ value }) => value).sort() ?? [];

    setServiceIdsSelected(updatedSelecteServices);
    onSelected(allServicesSelected ? [] : undefined);
  }, [serviceIdsSelected.length, options, onSelected]);

  const findServices = (partialServiceName: string) =>
    !partialServiceName
      ? options
      : //filter the service options to those containing the partialServiceName (case-insensitive)
        options.filter((option) => option.label.toLowerCase().includes(partialServiceName.toLowerCase()));

  return {
    serviceIdsSelected,
    isServiceSelectMenuOpen,
    toggleServiceMenu,
    selectAllServices,
    selectService,
    findServices
  };
};

export const DisplayServicesContent: FC<DisplayServicesContentProps> = function ({
  initialIdsSelected,
  options,
  onSelected
}) {
  const {
    serviceIdsSelected,
    isServiceSelectMenuOpen,
    toggleServiceMenu,
    selectAllServices,
    selectService,
    findServices
  } = useServiceSelection({ initialIdsSelected, options, onSelected });

  return (
    <Select
      variant={SelectVariant.checkbox}
      isOpen={isServiceSelectMenuOpen}
      placeholderText={TopologyLabels.DisplayServicesDefaultLabel}
      onSelect={(_, selection) => selectService(selection.toString())}
      onToggle={(_, isOpen) => toggleServiceMenu(isOpen)}
      selections={serviceIdsSelected}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ServiceFilterPlaceholderText}
      onFilter={(_, filterValue) =>
        findServices(filterValue).map((service) => (
          <SelectOption key={service.value} value={service.value}>
            {service.label}
          </SelectOption>
        ))
      }
      maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
      isCheckboxSelectionBadgeHidden
      footer={
        <Button variant="link" isInline onClick={selectAllServices}>
          {serviceIdsSelected.length === options.length ? TopologyLabels.DeselectAll : TopologyLabels.SelectAll}
        </Button>
      }
    >
      {options.map((option) => (
        <SelectOption key={option.key} value={option.value}>
          {option.label}
        </SelectOption>
      ))}
    </Select>
  );
};

const DisplayServices: FC<DisplayServicesProps> = function ({ initialIdsSelected, onSelected: onSelect }) {
  const { data: services } = useQuery({
    queryKey: [QueriesServices.GetServices],
    queryFn: () => RESTApi.fetchServices(),
    refetchInterval: UPDATE_INTERVAL
  });

  // Extract service options from fetched data (if available)
  const options = services?.results?.map(({ name, identity }) => ({
    key: identity,
    value: identity,
    label: name
  }));

  // If services options are not yet available, render a disabled placeholder
  if (!options) {
    return (
      <Select onToggle={() => null} isDisabled={true} placeholderText={TopologyLabels.DisplayServicesDefaultLabel} />
    );
  }

  // Determine initial selected service IDs (from props or all options)
  const ids = initialIdsSelected || options.map(({ value }) => value);

  return <DisplayServicesContent options={options} initialIdsSelected={ids} onSelected={onSelect} />;
};

export default DisplayServices;
