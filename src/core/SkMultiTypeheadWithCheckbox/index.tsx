import { FC, Ref, useEffect, useRef, useState } from 'react';

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  Button,
  MenuFooter
} from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import { SkSelectMultiTypeaheadCheckboxProps } from './SkMultiTypeheadWithCheckbox.interfaces';
import { useData } from './useData';

const SkSelectMultiTypeaheadCheckbox: FC<SkSelectMultiTypeaheadCheckboxProps> = function ({
  initIdsSelected = [],
  initOptions,
  isDisabled = false,
  onSelected
}) {
  const {
    inputValue,
    selected,
    selectOptions,
    isOpen,
    activeItem,
    focusedItemIndex,
    toggleServiceMenu,
    selectAllServices,
    selectService,
    onTextInputChange,
    onInputKeyDown,
    closeMenu
  } = useData({
    initIdsSelected,
    initOptions,
    onSelected
  });

  const [placeholder, setPlaceholder] = useState(`${selected.length} services selected`);
  const textInputRef = useRef<HTMLInputElement>();

  const handleSelectService = (item: string) => {
    selectService(item);
    textInputRef.current?.focus();
  };

  useEffect(() => {
    setPlaceholder(`${selected.length} services selected`);
  }, [selected]);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      isDisabled={isDisabled}
      variant="typeahead"
      role="togglebox"
      aria-label="Multi typeahead checkbox menu toggle"
      onClick={toggleServiceMenu}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={toggleServiceMenu}
          onChange={(_, value) => onTextInputChange(value)}
          onKeyDown={onInputKeyDown}
          id="multi-typeahead-select-checkbox-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={isDisabled ? '' : placeholder}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-multi-typeahead-checkbox-listbox"
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      role="menu"
      id="multi-typeahead-checkbox-select"
      isOpen={isOpen}
      selected={selected}
      onSelect={(_, selection) => handleSelectService(selection as string)}
      onOpenChange={(open) => !open && closeMenu()}
      toggle={toggle}
    >
      <SelectList id="select-multi-typeahead-checkbox-listbox">
        {selectOptions.map((option, index) => (
          <SelectOption
            {...(!option.isDisabled && { hasCheckbox: true })}
            isSelected={selected.includes(option.value)}
            key={option.value}
            isFocused={focusedItemIndex === index}
            className={option.className}
            id={`select-multi-typeahead-${option.value.replace(' ', '-')}`}
            {...option}
            ref={null}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
      <MenuFooter>
        <Button variant="link" isInline onClick={selectAllServices}>
          {TopologyLabels.DeselectAll}
        </Button>
      </MenuFooter>
    </Select>
  );
};

export default SkSelectMultiTypeaheadCheckbox;
