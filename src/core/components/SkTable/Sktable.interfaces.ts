export interface SKTable<T> {
    columns: {
        name: string;
        prop: keyof T;
        component?: string;
    }[];
    rows: T[];
    rowsCount?: number;
    title?: string;
    titleDescription?: string;
    components?: Record<string, Function>;
}
