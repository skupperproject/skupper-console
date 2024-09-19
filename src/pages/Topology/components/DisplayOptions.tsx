import { FC, MouseEvent as ReactMouseEvent, Ref, useCallback, useState } from 'react';

import { MenuToggle, MenuToggleElement, Select, SelectGroup, SelectOption } from '@patternfly/react-core';

import { TopologyDisplayOptionsMenu } from '@sk-types/Topology.interfaces';

import { DisplayUseOptionsStateProps, useDisplayOptionsState } from '../hooks/useDisplayOptionsState';
import { TopologyLabels } from '../Topology.enum';

interface DisplayOptionsProps extends DisplayUseOptionsStateProps {
  options: TopologyDisplayOptionsMenu[];
  optionsDisabled?: Record<string, boolean>;
}

const DisplayOptions: FC<DisplayOptionsProps> = function ({
  defaultSelected,
  options,
  onSelected,
  optionsDisabled = {}
}) {
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const { displayOptionsSelected, selectDisplayOptions } = useDisplayOptionsState({
    defaultSelected,
    onSelected
  });

  const toggleDisplayMenu = useCallback(() => {
    setIsDisplayMenuOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (_?: ReactMouseEvent<Element, MouseEvent>, selection?: string | number) =>
      selectDisplayOptions(selection!.toString()),
    [selectDisplayOptions]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsDisplayMenuOpen(false);
    }
  }, []);

  return (
    <Select
      isOpen={isDisplayMenuOpen}
      onSelect={handleSelect}
      onOpenChange={handleOpenChange}
      selected={displayOptionsSelected}
      toggle={(toggleRef) => <Toggle toggleRef={toggleRef} isOpen={isDisplayMenuOpen} onClick={toggleDisplayMenu} />}
    >
      {options.map((group, index) => (
        <SelectGroup key={index} label={group.title}>
          {group.items.map(({ key, value, label }) => (
            <Option
              key={key}
              value={value}
              label={label}
              isDisabled={optionsDisabled[value]}
              isSelected={displayOptionsSelected.includes(value)}
            />
          ))}
        </SelectGroup>
      ))}
    </Select>
  );
};

export default DisplayOptions;

const Toggle: FC<{ toggleRef: Ref<MenuToggleElement>; isOpen: boolean; onClick: () => void }> = function ({
  toggleRef,
  isOpen,
  onClick
}) {
  return (
    <MenuToggle ref={toggleRef} onClick={onClick} isExpanded={isOpen}>
      {TopologyLabels.DisplayPlaceholderText}
    </MenuToggle>
  );
};

const Option: FC<{
  key: string;
  value: string;
  label: string;
  isDisabled: boolean;
  isSelected: boolean;
}> = function ({ value, label, isDisabled, isSelected }) {
  return (
    <SelectOption value={value} isDisabled={isDisabled} hasCheckbox isSelected={isSelected}>
      {label}
    </SelectOption>
  );
};
