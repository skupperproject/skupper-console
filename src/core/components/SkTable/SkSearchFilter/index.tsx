import { useState, MouseEvent as ReactMouseEvent, Ref, FC, FormEvent, useEffect, memo } from 'react';

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
  ChipGroup,
  Chip,
  ToolbarFilter,
  Button
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { FilterType, FilterSelected, FilterTypeWithSearchText } from '@sk-types/SkFilter.interfaces';
import useDebounce from 'hooks/useDebounce';

import { SkSearchFilterController } from './services';
import { DEBOUNCE_TIME_MS } from './SkSearchFilter.constants';
import { SkSearchFilterLabels } from './SkSearchFilter.enum';

import './SkSearchFilter.css';

interface SkSearchFilterProps {
  text?: string;
  selectOptions: FilterType[];
  onSearch?: (filterSelected: FilterSelected) => void;
}

const SkSearchFilter: FC<SkSearchFilterProps> = memo(({ text = '', onSearch, selectOptions }) => {
  const initFiltersSearchValues = selectOptions.reduce((acc, { id }) => ({ ...acc, [id]: undefined }), {});

  const [searchText, setSearchText] = useState(text);
  const [isFilterTypeExpanded, setIsFilterTypeExpanded] = useState(false);
  const [filterTypeSelected, setFilterTypeSelected] = useState(selectOptions[0].id);
  const [filtersSelected, setFilterSelected] = useState<FilterSelected>(initFiltersSearchValues);

  // helps to avoid making unnecessary calls to the parent component whenever the filtersSelected state changes rapidly due to input text
  const filterDebounceValues = useDebounce<FilterSelected>(filtersSelected, DEBOUNCE_TIME_MS);

  // Input search functions
  const handleChangeSearchText = (_: FormEvent<HTMLInputElement>, newValue: string) => {
    setSearchText(newValue);

    if (!newValue) {
      return handleDeleteActiveFilters(filterTypeSelected);
    }

    setFilterSelected({ ...filtersSelected, [filterTypeSelected]: newValue });
  };

  const handleClearSearchText = () => {
    setSearchText('');
    handleDeleteActiveFilters(filterTypeSelected);
  };

  const handleToggleFilterType = () => {
    setIsFilterTypeExpanded(!isFilterTypeExpanded);
  };

  const handleChangeFilterType = (_?: ReactMouseEvent<Element, MouseEvent>, selected?: string | number) => {
    const selection = selected as keyof FilterSelected as string;

    setSearchText(filtersSelected[selection]!); // Assert filtersSelected[selection] is not undefined here
    setFilterTypeSelected(selection);
    setIsFilterTypeExpanded(false);
  };

  const handleDeleteActiveFilters = (idToDelete?: string) => {
    const searchFiltersSearchValues = idToDelete
      ? { ...filtersSelected, [idToDelete]: undefined }
      : initFiltersSearchValues;

    setFilterSelected(searchFiltersSearchValues);
  };

  useEffect(() => {
    if (onSearch && Object.keys(filterDebounceValues).length) {
      onSearch(filterDebounceValues);
    }
  }, [onSearch, filterDebounceValues]);

  const selectedFilter = selectOptions.find(({ id }) => id === filterTypeSelected)?.name;
  const selectedValues = SkSearchFilterController.getFilterTypesWithSearchValues(selectOptions, filtersSelected);

  return (
    <Toolbar collapseListedFiltersBreakpoint="xl">
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <Select
                data-testid="sk-select-filter-type"
                role="menu"
                toggle={(toggleRef: Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={handleToggleFilterType} isExpanded={isFilterTypeExpanded}>
                    <FilterIcon /> {selectedFilter}
                  </MenuToggle>
                )}
                onSelect={handleChangeFilterType}
                selected={filterTypeSelected}
                isOpen={isFilterTypeExpanded}
                onOpenChange={handleToggleFilterType}
              >
                <SelectList>
                  {selectOptions.map(({ id, name }) => (
                    <SelectOption key={id} value={id}>
                      {name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>

            <ToolbarItem variant="search-filter">
              <SearchInput
                data-testid="sk-search-box"
                className="sk-search-filter"
                placeholder={`${SkSearchFilterLabels.PlaceHolderInputSearchPrefix} ${selectedFilter?.toLocaleLowerCase()}`}
                onChange={handleChangeSearchText}
                value={searchText}
                onClear={handleClearSearchText}
              />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>

      {!!selectedValues.length && (
        <ToolbarContent>
          <ActiveFilters
            filterSelected={selectedValues}
            onDeleteAll={handleDeleteActiveFilters}
            onDeleteFilter={handleDeleteActiveFilters}
          />
        </ToolbarContent>
      )}
    </Toolbar>
  );
});

export default SkSearchFilter;

interface ActiveFilterProps {
  id: string;
  name: string;
  searchValue: string;
  onDelete: () => void;
}

const ActiveFilter: FC<ActiveFilterProps> = function ({ id, name, searchValue, onDelete }) {
  return (
    <ToolbarFilter key={`${id}${name}${searchValue}`} categoryName={name}>
      <ChipGroup categoryName={name}>
        <Chip onClick={onDelete}>{searchValue}</Chip>
      </ChipGroup>
    </ToolbarFilter>
  );
};

interface ActiveFiltersProps {
  filterSelected: FilterTypeWithSearchText[];
  onDeleteFilter: (id: string) => void;
  onDeleteAll: () => void;
}

const ActiveFilters: FC<ActiveFiltersProps> = function ({ filterSelected, onDeleteFilter, onDeleteAll }) {
  return (
    <ToolbarGroup spaceItems={{ default: 'spaceItemsSm' }}>
      <ToolbarItem data-testid="sk-group-filter-labels">
        {filterSelected.map((filter) => (
          <ActiveFilter
            key={`${filter.id}${filter.name}${filter.searchValue}`}
            {...filter}
            onDelete={() => onDeleteFilter(filter.id)}
          />
        ))}
      </ToolbarItem>

      <ToolbarItem>
        <Button data-testid="sk-group-filter-labels-btn" variant="link" onClick={() => onDeleteAll()}>
          {SkSearchFilterLabels.ClearAllLabelsBtn}
        </Button>
      </ToolbarItem>
    </ToolbarGroup>
  );
};
