import { useState, FC, FormEvent, useEffect, memo } from 'react';

import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarToggleGroup,
  ToolbarGroup,
  SearchInput,
  ChipGroup,
  Chip,
  ToolbarFilter,
  Button
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { SkSearchFilterController } from './services';
import { DEBOUNCE_TIME_MS } from './SkSearchFilter.constants';
import { SkSearchFilterLabels } from './SkSearchFilter.enum';
import { testIds } from './SkSearchFilter.testIds';
import useDebounce from '../../../../hooks/useDebounce';
import { FilterSelected, FilterTypeWithSearchText } from '../../../../types/SkFilter.interfaces';
import SkSelect, { SkSelectOption } from '../../SkSelect';

import './SkSearchFilter.css';

interface SkSearchFilterProps {
  text?: string;
  selectOptions: SkSelectOption[];
  onSearch?: (filterSelected: FilterSelected) => void;
}

const SkSearchFilter: FC<SkSearchFilterProps> = memo(({ text = '', onSearch, selectOptions }) => {
  const initFiltersSearchValues = selectOptions.reduce((acc, { id }) => ({ ...acc, [id]: undefined }), {});

  const [searchText, setSearchText] = useState(text);
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

  const handleChangeFilterType = (selected?: string | number) => {
    const selection = selected as keyof FilterSelected as string;

    setSearchText(filtersSelected[selection]!); // Assert filtersSelected[selection] is not undefined here
    setFilterTypeSelected(selection);
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

  const selectedFilter = selectOptions.find(({ id }) => id === filterTypeSelected)?.label;
  const selectedValues = SkSearchFilterController.getFilterTypesWithSearchValues(selectOptions, filtersSelected);

  return (
    <Toolbar collapseListedFiltersBreakpoint="xl">
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem data-testid={testIds.selectFilterType}>
              <SkSelect
                selected={filterTypeSelected}
                items={selectOptions}
                onSelect={handleChangeFilterType}
                icon={<FilterIcon />}
              />
            </ToolbarItem>

            <ToolbarItem variant="search-filter" data-testid={testIds.searchBox}>
              <SearchInput
                className="sk-search-filter"
                placeholder={`${SkSearchFilterLabels.PlaceHolderInputSearchPrefix} ${selectedFilter?.toString().toLocaleLowerCase()}`}
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
  label: string | number;
  searchValue: string;
  onDelete: () => void;
}

const ActiveFilter: FC<ActiveFilterProps> = function ({ id, label, searchValue, onDelete }) {
  return (
    <ToolbarFilter key={`${id}${label}${searchValue}`} categoryName={`${label}`}>
      <ChipGroup categoryName={`${label}`}>
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
      <ToolbarItem data-testid={testIds.groupFilterLabels}>
        {filterSelected.map((filter) => (
          <ActiveFilter
            key={`${filter.id}${filter.label}${filter.searchValue}`}
            {...filter}
            onDelete={() => onDeleteFilter(filter.id)}
          />
        ))}
      </ToolbarItem>

      <ToolbarItem>
        <Button data-testid={testIds.groupFilterLabelsBtn} variant="link" onClick={() => onDeleteAll()}>
          {SkSearchFilterLabels.ClearAllLabelsBtn}
        </Button>
      </ToolbarItem>
    </ToolbarGroup>
  );
};
