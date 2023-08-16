import { useState, MouseEvent as ReactMouseEvent, Ref, FC, FormEvent, useEffect } from 'react';

import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarToggleGroup,
  ToolbarGroup,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  debounce,
  ChipGroup,
  Chip,
  ToolbarFilter,
  Button
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

interface FilterValues {
  [key: string]: string;
}

const PlaceholderPrefixLabel = 'Search by';

const SearchFilter: FC<{ onSearch?: Function; selectOptions: { id: string; name: string }[] }> = function ({
  onSearch,
  selectOptions
}) {
  const [inputValue, setInputValue] = useState('');
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [statusSelected, setStatusSelected] = useState(selectOptions[0].id);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const handleInputChange = (_event: FormEvent<HTMLInputElement>, newValue: string) => {
    setInputValue(newValue);

    if (newValue) {
      const newFilterValues = { ...filterValues, [statusSelected]: newValue };
      setFilterValues(newFilterValues);
    } else {
      handleDeleteFilter(statusSelected);
    }
  };

  const handleSelect = (_?: ReactMouseEvent<Element, MouseEvent>, selected?: string | number) => {
    const selection = selected as keyof FilterValues;

    setInputValue(filterValues[selection] as string);
    setStatusSelected(selection as string);
    setIsStatusExpanded(false);
  };

  const handleDeleteFilter = (id: string) => {
    const newFilterValues = Object.fromEntries(Object.entries(filterValues).filter(([key]) => key !== id));
    setInputValue('');
    setFilterValues(newFilterValues);
  };

  const handleDeleteGroup = () => {
    setInputValue('');
    setFilterValues({});
  };

  const handleToggle = () => {
    setIsStatusExpanded(!isStatusExpanded);
  };

  useEffect(() => {
    if (onSearch) {
      onSearch(filterValues);
    }
  }, [filterValues, onSearch]);

  const statusMenuItems = selectOptions.map((option) => (
    <SelectOption key={option.id} value={option.id}>
      {option.name}
    </SelectOption>
  ));

  const filterNameSelected = selectOptions.find(({ id }) => id === statusSelected)?.name;
  const toggleGroupItems = (
    <ToolbarGroup variant="filter-group">
      <Select
        role="menu"
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={handleToggle} isExpanded={isStatusExpanded}>
            <FilterIcon /> {filterNameSelected}
          </MenuToggle>
        )}
        onSelect={handleSelect}
        selected={statusSelected}
        isOpen={isStatusExpanded}
        onOpenChange={handleToggle}
      >
        <SelectList>{statusMenuItems}</SelectList>
      </Select>

      <ToolbarItem variant="search-filter">
        <SearchInput
          className="sk-search-filter"
          placeholder={`${PlaceholderPrefixLabel} ${filterNameSelected?.toLocaleLowerCase()}`}
          onChange={debounce(handleInputChange, 300)}
          value={inputValue}
          onClear={debounce(handleInputChange, 0)}
        />
      </ToolbarItem>
    </ToolbarGroup>
  );

  const toolbarItems = (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      {toggleGroupItems}
    </ToolbarToggleGroup>
  );

  const toolbarFilterItems = (
    <ToolbarGroup spaceItems={{ default: 'spaceItemsSm' }}>
      {selectOptions.map(({ id, name }) => {
        const value = filterValues[id as keyof FilterValues];
        if (value) {
          return (
            <ToolbarFilter key={id} categoryName={name}>
              <ChipGroup categoryName={name}>
                <Chip key={value} onClick={() => handleDeleteFilter(id as string)}>
                  {value}
                </Chip>
              </ChipGroup>
            </ToolbarFilter>
          );
        }

        return null;
      })}

      {!!Object.keys(filterValues).length && (
        <ToolbarItem>
          <Button variant="link" onClick={handleDeleteGroup}>
            Clear all filters
          </Button>
        </ToolbarItem>
      )}
    </ToolbarGroup>
  );

  return (
    <Toolbar collapseListedFiltersBreakpoint="xl">
      <ToolbarContent>{toolbarItems}</ToolbarContent>
      <ToolbarContent>{toolbarFilterItems}</ToolbarContent>
    </Toolbar>
  );
};

export default SearchFilter;
