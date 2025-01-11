import { FilterSelected, FilterTypeWithSearchText } from '../../../../../types/SkFilter.interfaces';
import { SkSelectOption } from '../../../SkSelect';

export const SkSearchFilterController = {
  getFilterTypesWithSearchValues: (
    selectOptions: SkSelectOption[],
    filterValues: FilterSelected | undefined
  ): FilterTypeWithSearchText[] => {
    if (!filterValues) {
      return [];
    }

    return selectOptions
      .filter(({ id }) => filterValues[id as keyof FilterSelected])
      .map(({ id, label }) => ({
        id,
        label,
        searchValue: filterValues[id as keyof FilterSelected] as string
      }));
  }
};
