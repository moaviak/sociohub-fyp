import React, { useEffect, useRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  initialRowSelection?: Record<string, boolean>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onRowSelectionChange,
  initialRowSelection = {},
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] =
    React.useState<Record<string, boolean>>(initialRowSelection);

  // Keep track of previously selected rows to prevent unnecessary updates
  const prevSelectedRowsRef = useRef<TData[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  // Call onRowSelectionChange when rowSelection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getRowModel()
        .rows.filter((row) => row.getIsSelected())
        .map((row) => row.original);

      // Only update if the selection has actually changed
      if (
        JSON.stringify(selectedRows) !==
        JSON.stringify(prevSelectedRowsRef.current)
      ) {
        prevSelectedRowsRef.current = selectedRows;
        onRowSelectionChange(selectedRows);
      }
    }
  }, [rowSelection, table, onRowSelectionChange]);

  // Update rowSelection when initialRowSelection changes
  useEffect(() => {
    if (
      Object.keys(initialRowSelection).length > 0 &&
      JSON.stringify(initialRowSelection) !== JSON.stringify(rowSelection)
    ) {
      setRowSelection(initialRowSelection);
    }
  }, [initialRowSelection]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Show skeleton loading UI while data is being fetched
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((_col, index) => (
                  <TableCell key={index}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
