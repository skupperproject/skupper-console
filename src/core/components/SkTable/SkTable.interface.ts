export interface SKTableProps<T> {
    columns: SKColumn<T>[];
    rows?: T[];
    rowsCount?: number;
    pageSizeStart?: number;
    title?: string;
    titleDescription?: string;
    components?: Record<string, Function>;
    borders?: boolean;
    isStriped?: boolean;
    isPlain?: boolean;
    shouldSort?: boolean;
    urlPagination?: string;
    onGetFilters?: Function;
    onError?: Function;
    onLoaded?: Function;
}

export interface SKColumn<T> {
    name: string;
    prop?: keyof T;
    component?: string;
    callback?: Function;
    format?: Function;
    width?: number;
}
