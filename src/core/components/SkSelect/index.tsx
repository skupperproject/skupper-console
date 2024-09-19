import { FC, ReactNode, Ref, MouseEvent as ReactMouseEvent, useState } from 'react';

import { MenuToggle, MenuToggleElement, Select, SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';

type Selected = string | string[] | undefined;

interface SkSelectOption {
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface SkSelectGroupedOptions {
  title?: string;
  items: SkSelectOption[];
}

interface SkSelectProps {
  items: SkSelectOption[] | SkSelectGroupedOptions[];
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
  onSelect: (value: string) => void;
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

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (_: ReactMouseEvent | undefined, selection: string | number | undefined) => {
    if (forceClose) {
      setIsOpen(false);
    }

    onSelect(selection as string);
  };

  return (
    <Select
      role="menu"
      isOpen={isOpen}
      onSelect={handleSelect}
      onOpenChange={handleToggle}
      style={{
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      toggle={(toggleRef) => (
        <Toggle
          selected={selected}
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
              <Option
                key={index2}
                value={id}
                label={label}
                isDisabled={optionsDisabled[id]}
                isSelected={(selected?.length && selected.includes(id)) || false}
                hasCheckbox={hasCheckbox}
              />
            ))}
          </SelectGroup>
        ))
      ) : (
        <SelectList>
          {placeholder && <SelectOption value={undefined}>{placeholder}</SelectOption>}
          {(items as SkSelectOption[]).map(({ id, label }, index) => (
            <Option
              key={index}
              value={id}
              label={label}
              isDisabled={optionsDisabled[id]}
              isSelected={label === selected}
              hasCheckbox={hasCheckbox}
            />
          ))}
        </SelectList>
      )}
    </Select>
  );
};

export default SkSelect;

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
    <MenuToggle
      isDisabled={!!isDisabled}
      ref={toggleRef}
      onClick={onClick}
      isExpanded={isExpanded}
      icon={icon}
      disabled={isDisabled}
    >
      {(!forcePlaceholder && formatToggle(selected)) || placeholder}
    </MenuToggle>
  );
};

const Option: FC<{
  value: string;
  label: string;
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
