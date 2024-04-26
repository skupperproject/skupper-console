import { SkSearchFilterController } from '..'; // Assuming your service file path
import { FilterType, FilterTypeWithSearchText, FilterSelected } from '../../SkFilter.interfaces'; // Assuming your interface file path

describe('SkSearchFilterController', () => {
  describe('getFilterTypesWithSearchValues', () => {
    it('should return an empty array when filterValues is undefined', () => {
      const selectOptions: FilterType[] = [
        { id: 'filter1', name: 'Filter 1' },
        { id: 'filter2', name: 'Filter 2' }
      ];

      const result = SkSearchFilterController.getFilterTypesWithSearchValues(selectOptions, undefined);

      expect(result).toEqual([]);
    });

    it('should return all selected filters with search values', () => {
      const selectOptions: FilterType[] = [
        { id: 'filter1', name: 'Filter 1' },
        { id: 'filter2', name: 'Filter 2' }
      ];

      const filterValues: FilterSelected = {
        filter1: 'value1',
        filter2: 'value2'
      };

      const expectedResult: FilterTypeWithSearchText[] = [
        { id: 'filter1', name: 'Filter 1', searchValue: 'value1' },
        { id: 'filter2', name: 'Filter 2', searchValue: 'value2' }
      ];

      const result = SkSearchFilterController.getFilterTypesWithSearchValues(selectOptions, filterValues);

      expect(result).toEqual(expectedResult);
    });

    it('should return only selected filters with search values', () => {
      const selectOptions: FilterType[] = [
        { id: 'filter1', name: 'Filter 1' },
        { id: 'filter2', name: 'Filter 2' },
        { id: 'filter3', name: 'Filter 3' }
      ];

      const filterValues: FilterSelected = {
        filter1: 'value1',
        filter2: undefined
      };

      const expectedResult: FilterTypeWithSearchText[] = [{ id: 'filter1', name: 'Filter 1', searchValue: 'value1' }];

      const result = SkSearchFilterController.getFilterTypesWithSearchValues(selectOptions, filterValues);

      expect(result).toEqual(expectedResult);
    });
  });
});
