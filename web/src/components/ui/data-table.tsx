import React, { useEffect, useRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  Updater,
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
  // For server-side pagination
  isServerSide?: boolean;
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
  onPageSizeChange,
  isServerSide = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] =
    React.useState<Record<string, boolean>>(initialRowSelection);

  // Keep track of previously selected rows to prevent unnecessary updates
  const prevSelectedRowsRef = useRef<TData[]>([]);

  // For server-side pagination, manage pagination state
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: page - 1, // TanStack uses 0-based indexing
    pageSize: pageSize,
  });

  // Update pagination state when external page/pageSize changes
  useEffect(() => {
    if (isServerSide) {
      setPagination({
        pageIndex: page - 1,
        pageSize: pageSize,
      });
    }
  }, [page, pageSize, isServerSide]);

  // Handle pagination changes for server-side
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    if (isServerSide) {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);

      // Notify parent component of page change
      if (onPageChange && newPagination.pageIndex !== pagination.pageIndex) {
        onPageChange(newPagination.pageIndex + 1); // Convert back to 1-based
      }

      // Notify parent component of page size change
      if (onPageSizeChange && newPagination.pageSize !== pagination.pageSize) {
        onPageSizeChange(newPagination.pageSize);
      }
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only use pagination model for client-side pagination
    ...(isServerSide ? {} : { getPaginationRowModel: getPaginationRowModel() }),

    // Server-side pagination configuration
    ...(isServerSide && {
      manualPagination: true, // Tell TanStack this is server-side
      rowCount: totalCount, // Total number of rows on server
      onPaginationChange: handlePaginationChange,
    }),

    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      // Only set pagination state for server-side pagination
      ...(isServerSide && { pagination }),
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
      {isPaginated && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isServerSide) {
                table.previousPage();
              } else {
                if (onPageChange) onPageChange(page - 1);
              }
            }}
            disabled={isServerSide ? !table.getCanPreviousPage() : page <= 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="b3-regular text-neutral-700">
            Page{" "}
            {isServerSide ? table.getState().pagination.pageIndex + 1 : page} of{" "}
            {totalPages}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isServerSide) {
                table.nextPage();
              } else {
                if (onPageChange) onPageChange(page + 1);
              }
            }}
            disabled={
              isServerSide ? !table.getCanNextPage() : page >= totalPages
            }
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
