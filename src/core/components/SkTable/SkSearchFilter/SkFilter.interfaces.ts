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

export interface ActiveFiltersProps {
  filterSelected: FilterTypeWithSearchText[];
  onDeleteFilter: (id: string) => void;
  onDeleteAll: () => void;
}

export interface ActiveFilterProps {
  id: string;
  name: string;
  searchValue: string;
  onDelete: () => void;
}
