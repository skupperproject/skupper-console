import { FC, ReactNode, MouseEvent as ReactMouseEvent, useState, Ref } from 'react';

import { MenuToggle, MenuToggleElement, SelectOption, Select } from '@patternfly/react-core';

interface PopperSelectProps {
  selectedItem: string | undefined;
  items: { id: string; label: string }[];
  onSelect: (selection: string) => void;
  placeholder: string;
  icon?: ReactNode;
  isDisabled?: boolean;
}

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

const PopperSelect: FC<PopperSelectProps> = function ({
  selectedItem,
  items,
  onSelect,
  placeholder,
  icon,
  isDisabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (_: ReactMouseEvent | undefined, selection: string | number | undefined) => {
    onSelect(selection as string);
    setIsOpen(false);
  };

  return (
    <Select
      isOpen={isOpen}
      onSelect={handleSelect}
      onOpenChange={handleToggle}
      style={{
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      toggle={(toggleRef) => (
        <Toggle
          selected={selectedItem}
          isDisabled={isDisabled}
          toggleRef={toggleRef}
          isExpanded={isOpen}
          onClick={handleToggle}
          icon={icon}
          placeholder={placeholder}
        />
      )}
    >
      <SelectOption value={undefined}>{placeholder}</SelectOption>
      {items.map(({ id, label }, index) => (
        <Option key={index} value={id} label={label} isSelected={label === selectedItem} />
      ))}
    </Select>
  );
};

export default PopperSelect;

const Toggle: FC<{
  toggleRef: Ref<MenuToggleElement>;
  isExpanded: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  selected?: string;
  placeholder?: string;
  icon?: ReactNode;
}> = function ({ toggleRef, isExpanded, isDisabled, selected, placeholder, icon, onClick }) {
  return (
    <MenuToggle
      isDisabled={!!isDisabled}
      ref={toggleRef}
      onClick={onClick}
      isExpanded={isExpanded}
      icon={icon}
      disabled={isDisabled}
    >
      {selected || placeholder}
    </MenuToggle>
  );
};

const Option: FC<{
  value: string;
  label: string;
  isSelected: boolean;
}> = function ({ value, label, isSelected }) {
  return (
    <SelectOption value={value} isSelected={isSelected}>
      {label}
    </SelectOption>
  );
};
