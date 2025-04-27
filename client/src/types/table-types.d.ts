// types/table-types.d.ts
import { FilterFn } from '@tanstack/react-table';

declare module '@tanstack/table-core' {
    interface FilterFns {
        fuzzy?: FilterFn<unknown>;
        commentFuzzy?: FilterFn<unknown>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        tdClassName?: string;
    }
}
