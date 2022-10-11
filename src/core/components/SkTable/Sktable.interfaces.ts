export interface SKTable<T> {
    columns: {
        name: string;
        prop: keyof T;
        component?: string;
    }[];
    rows: T[];
    title?: string;
    titleDescription?: string;
    components?: Record<string, Function>;
}
