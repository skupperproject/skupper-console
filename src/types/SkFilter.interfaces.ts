import { SkSelectOption } from '@core/components/SkSelect';

export interface FilterTypeWithSearchText extends SkSelectOption {
  searchValue: string;
}

export interface FilterSelected {
  [key: string]: string | undefined;
}
