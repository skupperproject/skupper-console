import { FC, FormEvent, Ref, useCallback, useRef, useState } from 'react';

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

const DisplayResources: FC<DisplayResourcesProps> = function ({
  id,
  placeholder = TopologyLabels.DisplayResourcesDefaultLabel,
  onSelect,
  options
}) {
  const [inputValue, setInputValue] = useState<string>(findOptionSelected(options, id)?.name || '');
  const [isOpen, setIsOpen] = useState(false);

  const filterValueRef = useRef<string>('');
  const textInputRef = useRef<HTMLInputElement>();

  function handleToggleMenu() {
    setIsOpen(!isOpen);
  }

  function handleClear() {
    setInputValue('');
    filterValueRef.current = '';
    textInputRef.current?.focus();

    if (onSelect) {
      onSelect(undefined);
    }
  }

  const handleSelect = useCallback(
    (idSelected: string) => {
      const nameSelected = findOptionSelected(options, idSelected)?.name || '';

      setIsOpen(false);
      setInputValue(nameSelected);
      filterValueRef.current = '';

      if (onSelect) {
        onSelect(idSelected);
      }
    },
    [onSelect, options]
  );

  const handleTextInputChange = (_: FormEvent<HTMLInputElement>, selection: string) => {
    setInputValue(selection);
    filterValueRef.current = selection;
  };

  const selectOptions = (options || []).filter(
    ({ name }) =>
      !filterValueRef.current || name.toString().toLowerCase().includes(filterValueRef.current.toLowerCase())
  );

  return (
    <Select
      role="resource-select"
      isOpen={isOpen}
      selected={id}
      maxMenuHeight={`${FILTER_BY_SERVICE_MAX_HEIGHT}px`}
      isScrollable
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} isExpanded={isOpen} onClick={handleToggleMenu} variant="typeahead">
          <TextInputGroup isPlain>
            <TextInputGroupMain
              value={inputValue}
              onClick={handleToggleMenu}
              onChange={handleTextInputChange}
              autoComplete="off"
              innerRef={textInputRef}
              placeholder={placeholder}
              role="combobox"
              isExpanded={isOpen}
            />

            <TextInputGroupUtilities>
              {!!inputValue && (
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
          <SelectOption
            key={identity}
            value={identity}
            onClick={() => handleSelect(identity)}
            isSelected={identity === id}
          >
            {name}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default DisplayResources;

function findOptionSelected(options: ResourcesOptionsProps[], idSelected?: string) {
  return options.find(({ identity }) => identity === idSelected);
}
