import React, { useEffect, useRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { Button } from "./button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  initialRowSelection?: Record<string, boolean>;
  isPaginated?: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Add this prop to disable internal pagination
  disableInternalPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onRowSelectionChange,
  initialRowSelection = {},
  isPaginated = false,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  disableInternalPagination = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] =
    React.useState<Record<string, boolean>>(initialRowSelection);

  // Keep track of previously selected rows to prevent unnecessary updates
  const prevSelectedRowsRef = useRef<TData[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only use pagination model if internal pagination is not disabled
    ...(disableInternalPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      // Only set pagination state if internal pagination is enabled
      ...(disableInternalPagination
        ? {}
        : {
            pagination: {
              pageIndex: page - 1,
              pageSize,
            },
          }),
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isPaginated && !disableInternalPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="b3-regular text-neutral-700">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
