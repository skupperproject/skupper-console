import { useEffect, useState } from 'react';

import { SelectOptionProps } from '@patternfly/react-core';

import { EMPTY_VALUE_SYMBOL } from '../../../config/app';

export interface SkSelectTypeHeadWithCheckboxUseDataUseDataProps {
  initIdsSelected: string[];
  initOptions: {
    value: string;
    label: string;
    isDisabled?: boolean;
  }[];
  onSelected?: (items: string[]) => void;
}

export const SkSelectTypeHeadWithCheckboxUseData = ({
  initIdsSelected,
  initOptions,
  onSelected
}: SkSelectTypeHeadWithCheckboxUseDataUseDataProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(initIdsSelected);
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(initOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleServiceMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const selectService = (value: string) => {
    if (value && value !== 'no results') {
      const items = selected.includes(value)
        ? selected.filter((selection) => selection !== value)
        : [...selected, value];

      setSelected(
        selected.includes(value) ? selected.filter((selection) => selection !== value) : [...selected, value]
      );

      if (onSelected) {
        onSelected(items);
      }
    }
  };

  const clearAllServices = () => {
    setSelected([]);
    onSelected?.([]);
  };

  const onTextInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    if (isOpen) {
      let indexToFocus;

      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = initOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === initOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      if (indexToFocus !== undefined) {
        setFocusedItemIndex(indexToFocus);

        const focusedItem = initOptions.filter((option) => !option.isDisabled)[indexToFocus];
        setActiveItem(`select-multi-typeahead-checkbox-${focusedItem.value.replace(' ', EMPTY_VALUE_SYMBOL)}`);
      }
    }
  };

  const onInputKeyDown = ({ key }: { key: string }) => {
    const enabledMenuItems = initOptions.filter((menuItem) => !menuItem.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (key) {
      // Select the first available option
      case 'Enter':
        if (!isOpen) {
          setIsOpen((prevIsOpen) => !prevIsOpen);
        } else if (isOpen && focusedItem.value !== 'no results') {
          selectService(focusedItem.value as string);
        }
        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        handleMenuArrowKeys(key);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initOptions;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = initOptions.filter((menuItem) =>
        String(menuItem.label).toLowerCase().includes(inputValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: false,
            label: `No results found for "${inputValue}"`,
            value: 'no results',
            hasCheckbox: false
          }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setFocusedItemIndex(null);
    setActiveItem(null);
  }, [inputValue, isOpen, initOptions]);

  return {
    inputValue,
    selected,
    selectOptions,
    isOpen,
    activeItem,
    focusedItemIndex,
    toggleServiceMenu,
    selectAllServices: clearAllServices,
    selectService,
    onTextInputChange,
    handleMenuArrowKeys,
    onInputKeyDown,
    closeMenu
  };
};
