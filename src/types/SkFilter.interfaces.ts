export interface FilterType {
  id: string;
  name: string;
}

export interface FilterTypeWithSearchText extends FilterType {
  searchValue: string;
}

export interface FilterSelected {
  [key: string]: string | undefined;
}
