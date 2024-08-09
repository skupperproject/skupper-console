import { FC, Ref, useCallback, useState } from 'react';

import { MenuToggle, MenuToggleElement, Select, SelectGroup, SelectOption } from '@patternfly/react-core';

import { TopologyDisplayOptionsMenu } from '@sk-types/Topology.interfaces';

import {
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';

interface DisplayUseOptionsProps {
  defaultSelected?: string[];
  onSelected: (items: string[], item: string) => void;
}

interface DisplayOptionsProps extends DisplayUseOptionsProps {
  options: TopologyDisplayOptionsMenu[];
  optionsDisabled?: Record<string, boolean>;
}

export const useDisplayOptions = ({ defaultSelected = [], onSelected }: DisplayUseOptionsProps) => {
  const [displayOptionsSelected, setDisplayOptions] = useState(defaultSelected);

  const selectDisplayOptions = useCallback(
    (selectedOption: string) => {
      const isOptionSelected = displayOptionsSelected.includes(selectedOption);

      let updatedDisplayOptions = isOptionSelected
        ? displayOptionsSelected.filter((option) => option !== selectedOption)
        : [...displayOptionsSelected, selectedOption];

      if (
        selectedOption === SHOW_LINK_BYTES ||
        selectedOption === SHOW_LINK_BYTERATE ||
        selectedOption === SHOW_LINK_LATENCY
      ) {
        updatedDisplayOptions = isOptionSelected
          ? displayOptionsSelected.filter((option) => option !== selectedOption)
          : [
              ...displayOptionsSelected.filter(
                (option) => option !== SHOW_LINK_BYTES && option !== SHOW_LINK_BYTERATE && option !== SHOW_LINK_LATENCY
              ),
              selectedOption
            ];
      }

      if (selectedOption === SHOW_DATA_LINKS || selectedOption === SHOW_ROUTER_LINKS) {
        const otherOption = selectedOption === SHOW_DATA_LINKS ? SHOW_ROUTER_LINKS : SHOW_DATA_LINKS;

        updatedDisplayOptions = isOptionSelected
          ? [...updatedDisplayOptions, otherOption]
          : updatedDisplayOptions.filter((option) => option !== otherOption);
      }

      setDisplayOptions(updatedDisplayOptions);
      onSelected(updatedDisplayOptions, selectedOption);
    },
    [displayOptionsSelected, onSelected]
  );

  return { displayOptionsSelected, selectDisplayOptions };
};

const DisplayOptions: FC<DisplayOptionsProps> = function ({
  defaultSelected,
  options,
  onSelected,
  optionsDisabled = {}
}) {
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const { displayOptionsSelected, selectDisplayOptions } = useDisplayOptions({
    defaultSelected,
    onSelected
  });

  function toggleDisplayMenu() {
    setIsDisplayMenuOpen(!isDisplayMenuOpen);
  }

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={toggleDisplayMenu} isExpanded={isDisplayMenuOpen}>
      {TopologyLabels.DisplayPlaceholderText}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isDisplayMenuOpen}
      onSelect={(_, selection) => selectDisplayOptions(selection!.toString())}
      onOpenChange={(open) => !open && setIsDisplayMenuOpen(false)}
      selected={displayOptionsSelected}
      toggle={toggle}
    >
      {options.map((group, index) => (
        <SelectGroup key={index} label={group.title}>
          {group.items.map(({ key, value, label }) => (
            <SelectOption
              key={key}
              value={value}
              isDisabled={optionsDisabled[value]}
              hasCheckbox
              isSelected={displayOptionsSelected.includes(value)}
            >
              {label}
            </SelectOption>
          ))}
        </SelectGroup>
      ))}
    </Select>
  );
};

export default DisplayOptions;
