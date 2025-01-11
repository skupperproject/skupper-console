import { useCallback, useState } from 'react';

import {
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_METRIC_DISTRIBUTION,
  SHOW_LINK_METRIC_VALUE,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';

export interface DisplayUseOptionsStateProps {
  defaultSelected?: string[];
  onSelected: (items: string[], item: string) => void;
}

const toggleOption = (selectedOption: string, options: string[], isOptionSelected: boolean) =>
  isOptionSelected ? options.filter((option) => option !== selectedOption) : [...options, selectedOption];

const filterLinkMetrics = (options: string[]) =>
  options.filter((option) => ![SHOW_LINK_BYTES, SHOW_LINK_BYTERATE].includes(option));

const shouldAddMetricDistribution = (isOptionSelected: boolean, options: string[]) =>
  !isOptionSelected && !options.includes(SHOW_LINK_METRIC_DISTRIBUTION) && !options.includes(SHOW_LINK_METRIC_VALUE);

const handleLinkMetrics = (selectedOption: string, isOptionSelected: boolean, options: string[]) => {
  let updatedOptions = toggleOption(selectedOption, options, isOptionSelected);

  if (!isOptionSelected) {
    updatedOptions = [...filterLinkMetrics(options), selectedOption];

    if (shouldAddMetricDistribution(isOptionSelected, options)) {
      updatedOptions.push(SHOW_LINK_METRIC_DISTRIBUTION);
    }
  }

  return updatedOptions;
};

const handleDataRouterLinks = (selectedOption: string, isOptionSelected: boolean, options: string[]) => {
  const otherOption = selectedOption === SHOW_DATA_LINKS ? SHOW_ROUTER_LINKS : SHOW_DATA_LINKS;

  return isOptionSelected ? [...options, otherOption] : options.filter((option) => option !== otherOption);
};

export const useDisplayOptionsState = ({ defaultSelected = [], onSelected }: DisplayUseOptionsStateProps) => {
  const [displayOptionsSelected, setDisplayOptions] = useState(defaultSelected);

  const selectDisplayOptions = useCallback(
    (selectedOption: string | number | undefined) => {
      const selected = selectedOption as string;

      const isOptionSelected = displayOptionsSelected.includes(selected);

      let updatedDisplayOptions = toggleOption(selected, displayOptionsSelected, isOptionSelected);

      if ([SHOW_LINK_BYTES, SHOW_LINK_BYTERATE].includes(selected)) {
        updatedDisplayOptions = handleLinkMetrics(selected, isOptionSelected, displayOptionsSelected);
      }

      if ([SHOW_DATA_LINKS, SHOW_ROUTER_LINKS].includes(selected)) {
        updatedDisplayOptions = handleDataRouterLinks(selected, isOptionSelected, updatedDisplayOptions);
      }

      setDisplayOptions(updatedDisplayOptions);
      onSelected(updatedDisplayOptions, selected);
    },
    [displayOptionsSelected, onSelected]
  );

  return { displayOptionsSelected, selectDisplayOptions };
};
