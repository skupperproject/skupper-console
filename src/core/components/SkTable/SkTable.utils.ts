import { getValueFromNestedProperty } from '@core/utils/getValueFromNestedProperty';
import { NonNullableValue, SKTableColumn } from '@sk-types/SkTable.interfaces';

type ColumnVisibilityConfig<T> = {
  [key in keyof T]?: boolean;
};

/**
 * Sets the visibility of table columns based on the provided visibility configuration.
 */
export function setColumnVisibility<T>(
  tableColumns: SKTableColumn<T>[],
  visibilityConfig: Partial<ColumnVisibilityConfig<T>> = {}
): SKTableColumn<T>[] {
  return tableColumns.map((column) => {
    if (column.prop && column.prop in visibilityConfig) {
      return {
        ...column,
        show: visibilityConfig[column.prop]
      };
    }

    return {
      ...column,
      show: column.show ?? true
    };
  });
}

export function sortRowsByColumnName<T>(rows: NonNullableValue<T>[], columnName: string, direction: number) {
  return rows.sort((a, b) => {
    // Get the values of the sort column for the two rows being compared, and handle null values.
    const paramA = getValueFromNestedProperty(a, columnName.split('.') as (keyof T)[]);
    const paramB = getValueFromNestedProperty(b, columnName.split('.') as (keyof T)[]);

    if (paramA == null || paramB == null || paramA === paramB) {
      return 0;
    }

    return paramA > paramB ? direction : -direction;
  });
}
