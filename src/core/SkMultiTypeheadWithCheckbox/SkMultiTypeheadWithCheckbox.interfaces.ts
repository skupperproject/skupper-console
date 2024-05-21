interface Option {
  value: string;
  label: string;
  isDisabled?: boolean;
}

export interface UseDataProps {
  initIdsSelected: string[];
  initOptions: Option[];
  onSelected?: (items: string[] | undefined) => void;
}

export interface SkSelectMultiTypeaheadCheckboxProps extends UseDataProps {
  initIdsSelected: string[];
  isDisabled?: boolean;
}
