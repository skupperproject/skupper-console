import { FC, ReactNode, Ref, MouseEvent as ReactMouseEvent, useState, useCallback } from 'react';

import { MenuToggle, MenuToggleElement, Select, SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';

type SelectParam = string | number | undefined;
type Selected = SelectParam | string[];

export interface SkSelectOption {
  id: string;
  label: string | number;
  isDisabled?: boolean;
}

export interface SkSelectGroupedOptions {
  title?: string;
  items: SkSelectOption[];
}

type SelectOptions = SkSelectOption[] | SkSelectGroupedOptions[];

interface SkSelectProps {
  items: SelectOptions;
  selected: Selected;
  isGrouped?: boolean;
  placeholder?: string;
  forcePlaceholder?: boolean;
  forceClose?: boolean;
  isDisabled?: boolean;
  hasCheckbox?: boolean;
  optionsDisabled?: { [key: string]: boolean };
  icon?: ReactNode;
  formatToggle?: (value: Selected) => Selected;
  onSelect: (value: SelectParam) => void;
}

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const SkSelect: FC<SkSelectProps> = function ({
  selected,
  items,
  placeholder,
  icon,
  isGrouped = false,
  forcePlaceholder = false,
  forceClose = true,
  hasCheckbox = false,
  isDisabled = false,
  optionsDisabled = {},
  formatToggle = (value) => value,
  onSelect
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (_: ReactMouseEvent | undefined, selection: SelectParam) => {
      if (forceClose) {
        setIsOpen(false);
      }

      onSelect(selection);
    },
    [forceClose, onSelect]
  );

  return (
    <Select
      role="menu"
      isOpen={isOpen}
      onSelect={handleSelect}
      style={{
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      toggle={(toggleRef) => (
        <Toggle
          selected={getSelectedLabel(items, selected)}
          isDisabled={isDisabled}
          toggleRef={toggleRef}
          isExpanded={isOpen}
          onClick={handleToggle}
          icon={icon}
          placeholder={placeholder}
          forcePlaceholder={forcePlaceholder}
          formatToggle={formatToggle}
        />
      )}
    >
      {isGrouped ? (
        (items as SkSelectGroupedOptions[]).map((group, index) => (
          <SelectGroup key={index} label={group.title}>
            {group.items.map(({ id, label }, index2) => (
              <Options
                key={index2}
                value={id}
                label={label}
                isDisabled={optionsDisabled[id] ?? false}
                isSelected={(Array.isArray(selected) && selected.includes(id)) || selected === id}
                hasCheckbox={hasCheckbox}
              />
            ))}
          </SelectGroup>
        ))
      ) : (
        <SelectList>
          {placeholder && <SelectOption value={undefined}>{placeholder}</SelectOption>}
          {(items as SkSelectOption[]).map(({ id, label }, index) => (
            <Options
              key={index}
              value={id}
              label={label}
              isDisabled={optionsDisabled[id] ?? false}
              isSelected={id === selected}
              hasCheckbox={hasCheckbox}
            />
          ))}
        </SelectList>
      )}
    </Select>
  );
};

export default SkSelect;

// Toggle component
const Toggle: FC<{
  toggleRef: Ref<MenuToggleElement>;
  isExpanded: boolean;
  isDisabled?: boolean;
  selected?: Selected;
  placeholder?: string;
  forcePlaceholder: boolean;
  icon?: ReactNode;
  formatToggle: (value: Selected) => Selected;
  onClick: () => void;
}> = function ({
  toggleRef,
  isExpanded,
  isDisabled,
  selected,
  placeholder,
  forcePlaceholder,
  icon,
  formatToggle,
  onClick
}) {
  return (
    <MenuToggle isDisabled={!!isDisabled} ref={toggleRef} onClick={onClick} isExpanded={isExpanded} icon={icon}>
      {(!forcePlaceholder && formatToggle(selected)) || placeholder}
    </MenuToggle>
  );
};

const Options: FC<{
  value: string;
  label: string | number;
  isDisabled: boolean;
  isSelected: boolean;
  hasCheckbox: boolean;
}> = function ({ value, label, isDisabled, isSelected, hasCheckbox }) {
  return (
    <SelectOption value={value} isDisabled={isDisabled} hasCheckbox={hasCheckbox} isSelected={isSelected}>
      {label}
    </SelectOption>
  );
};

// Utility function to get selected label
function getSelectedLabel(options: SelectOptions, selected: Selected): SelectParam {
  // Ensure options is a valid array and has at least one element
  if (Array.isArray(options) && options.length > 0) {
    // Check if the first element has the 'id' property (i.e., it's a flat list of SkSelectOption)
    if ('id' in options[0]) {
      return (options as SkSelectOption[]).find((option) => option.id === selected)?.label;
    }

    // If options are grouped (SkSelectGroupedOptions[])
    for (const group of options as SkSelectGroupedOptions[]) {
      const foundItem = group.items.find((option) => option.id === selected);
      if (foundItem) {
        return foundItem.label;
      }
    }
  }

  // Return undefined if no matching label is found
  return undefined;
}
