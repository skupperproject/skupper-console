import { FilterType, FilterSelected, FilterTypeWithSearchText } from '../SkFilter.interfaces';

export const SkSearchFilterController = {
  getFilterTypesWithSearchValues: (
    selectOptions: FilterType[],
    filterValues: FilterSelected | undefined
  ): FilterTypeWithSearchText[] => {
    if (!filterValues) {
      return [];
    }

    return selectOptions
      .filter(({ id }) => filterValues[id as keyof FilterSelected])
      .map(({ id, name }) => ({
        id,
        name,
        searchValue: filterValues[id as keyof FilterSelected] as string
      }));
  }
};
