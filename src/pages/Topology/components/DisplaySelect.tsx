import { ChangeEvent, FC, MouseEvent, useCallback, useState } from 'react';

import { Divider } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant, SelectOptionObject } from '@patternfly/react-core/deprecated';

import { SHOW_DATA_LINKS, SHOW_ROUTER_LINKS } from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';
import { DisplaySelectProps } from '../Topology.interfaces';

const DisplaySelect: FC<{
  options: DisplaySelectProps[];
  defaultSelected?: string[];
  onSelect: Function;
}> = function ({ options, defaultSelected = [], onSelect }) {
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(defaultSelected);

  const addDisplayOptionToSelection = useCallback(
    (selected: string) => [...displayOptionsSelected, selected],
    [displayOptionsSelected]
  );

  const removeDisplayOptionToSelection = useCallback(
    (selected: string) => displayOptionsSelected.filter((option) => option !== selected),
    [displayOptionsSelected]
  );

  function handleToggleDisplayMenu(openDisplayMenu: boolean) {
    setIsDisplayMenuOpen(openDisplayMenu);
  }

  const handleSelectDisplay = useCallback(
    (_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) => {
      const currentSelected = selection as string;
      const isSelected = displayOptionsSelected.includes(currentSelected);

      let newSelectedOptions = isSelected
        ? removeDisplayOptionToSelection(currentSelected)
        : addDisplayOptionToSelection(currentSelected);

      if (currentSelected === SHOW_DATA_LINKS) {
        newSelectedOptions = isSelected
          ? [...newSelectedOptions, SHOW_ROUTER_LINKS]
          : newSelectedOptions.filter((option) => option !== SHOW_ROUTER_LINKS);
      }

      if (currentSelected === SHOW_ROUTER_LINKS) {
        newSelectedOptions = isSelected
          ? [...newSelectedOptions, SHOW_DATA_LINKS]
          : newSelectedOptions.filter((option) => option !== SHOW_DATA_LINKS);
      }

      setDisplayOptions(newSelectedOptions);

      if (onSelect) {
        onSelect(newSelectedOptions, currentSelected);
      }
    },
    [addDisplayOptionToSelection, displayOptionsSelected, onSelect, removeDisplayOptionToSelection]
  );

  return (
    <Select
      role="display-select"
      variant={SelectVariant.checkbox}
      isOpen={isDisplayMenuOpen}
      onSelect={handleSelectDisplay}
      onToggle={(_, isOpen) => handleToggleDisplayMenu(isOpen)}
      selections={displayOptionsSelected}
      placeholderText={TopologyLabels.DisplayPlaceholderText}
      isCheckboxSelectionBadgeHidden
    >
      {options.map((option) => (
        <SelectOption
          key={option.key}
          value={option.value}
          isDisabled={option?.isDisabled ? option.isDisabled() : false}
        >
          {option.label}
          {option.addSeparator && <Divider />}
        </SelectOption>
      ))}
    </Select>
  );
};

export default DisplaySelect;
