import { FC, FormEvent, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { TopologyLabels } from '../Topology.enum';

export interface ResourcesOptionsProps {
  name: string;
  identity: string;
}

interface DisplayResourcesProps {
  id?: string;
  options: ResourcesOptionsProps[];
  onSelect: Function;
  placeholder?: string;
}

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;
const FILTER_BY_SERVICE_MIN_WIDTH = 150;

const DisplayResources: FC<DisplayResourcesProps> = function ({
  id,
  placeholder = TopologyLabels.DisplayResourcesDefaultLabel,
  onSelect,
  options
}) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const textInputRef = useRef<HTMLInputElement>();

  function handleToggleMenu() {
    setIsOpen(!isOpen);
  }

  function handleClear() {
    setInputValue('');

    if (onSelect) {
      onSelect(undefined);
    }
  }

  const handleSelect = useCallback(
    (selection: string) => {
      const currentSelected = selection;

      setIsOpen(false);
      setInputValue('');

      if (onSelect) {
        onSelect(currentSelected);
      }
    },
    [onSelect]
  );

  const handleTextInputChange = (_: FormEvent<HTMLInputElement>, selection: string) => {
    setInputValue(selection);
  };

  useEffect(() => {
    if (inputValue && !isOpen) {
      setIsOpen(true);
    }
  }, [inputValue, isOpen]);

  const selectOptions = useMemo(
    () =>
      (options || []).filter(
        ({ name }) => !inputValue || name.toString().toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, options]
  );

  return (
    <Select
      role="resource-select"
      isOpen={isOpen}
      selected={id}
      style={{
        minWidth: `${FILTER_BY_SERVICE_MIN_WIDTH}px`,
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={handleToggleMenu} isExpanded={isOpen} isFullWidth variant="typeahead">
          <TextInputGroup isPlain>
            <TextInputGroupMain
              value={inputValue || options.find(({ identity }) => identity === id)?.name}
              onClick={handleToggleMenu}
              onChange={handleTextInputChange}
              autoComplete="off"
              innerRef={textInputRef}
              placeholder={placeholder}
              role="combobox"
              isExpanded={isOpen}
            />

            <TextInputGroupUtilities>
              {!!(inputValue || options.find(({ identity }) => identity === id)?.name) && (
                <Button variant="plain" onClick={handleClear} aria-label="Clear input value">
                  <TimesIcon aria-hidden />
                </Button>
              )}
            </TextInputGroupUtilities>
          </TextInputGroup>
        </MenuToggle>
      )}
    >
      <SelectList>
        {selectOptions.map(({ name, identity }) => (
          <SelectOption key={identity} value={identity} onClick={() => handleSelect(identity)}>
            {name}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default DisplayResources;
