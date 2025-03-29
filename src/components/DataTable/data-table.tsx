"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowSelectionState,
  Table as TableProps,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
  refetch: () => void;
  totalDocs: number;
  isFetching: boolean;
  onClick?: (row: TData) => void;
  setRowSelection?: Dispatch<SetStateAction<RowSelectionState>>;
  rowSelection?: RowSelectionState;
}

export function DataTable<TData>({
  columns,
  data,
  currentPage,
  setCurrentPage,
  limit,
  refetch,
  totalDocs = 1,
  isFetching,
  onClick,
  setRowSelection,
  rowSelection,
}: DataTableProps<TData>) {
  useEffect(() => {
    refetch();
  }, [currentPage]);

  console.log(data);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row) => (row?.id ? row?.id.toString() : ""),
    enableRowSelection: true,
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="rounded-2xl border">
        <Table>
          <TableHeader className="bg-gray-200 !text-black !rounded-2xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="!text-black py-4 !font-medium"
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === "asc"
                                ? "Sort ascending"
                                : header.column.getNextSortingOrder() === "desc"
                                ? "Sort descending"
                                : "Clear sort"
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn("bg-white", onClick && "cursor-pointer")}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onClick && onClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-4 font-medium text-sm text-gray-700"
                    >
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
      <Pagination
        totalDocs={totalDocs}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
      />
    </div>
  );
}

interface PaginationProps {
  totalDocs: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
}

const Pagination = ({
  totalDocs,
  currentPage,
  setCurrentPage,
  limit,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalDocs / limit);

  // Adjust these numbers to control how many pages to show around the current page.
  const siblingCount = 1;

  /**
   * Returns an array representing the pagination range.
   * For example: [1, "...", 4, 5, 6, "...", 10]
   */
  const getPaginationRange = (): (number | string)[] => {
    const totalPageNumbers = siblingCount * 2 + 5;
    // If there aren't enough pages, show all of them
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    const paginationRange: (number | string)[] = [];

    // Always include first page.
    currentPage > 2 && paginationRange.push(1);

    if (showLeftEllipsis) {
      paginationRange.push("...");
    } else {
      // No ellipsis needed, include the pages between 2 and leftSiblingIndex - 1
      for (let i = 2; i < leftSiblingIndex; i++) {
        paginationRange.push(i);
      }
    }

    // Pages between the siblings.
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      paginationRange.push(i);
    }

    if (showRightEllipsis) {
      paginationRange.push("...");
    } else {
      // No ellipsis needed, include the pages between rightSiblingIndex + 1 and last page - 1
      for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
        paginationRange.push(i);
      }
    }

    // Always include last page.
    currentPage < totalPages - 1 && paginationRange.push(totalPages);

    return paginationRange;
  };

  const paginationRange = getPaginationRange();

  return (
    <div className="mt-4 flex justify-center">
      <div className="flex justify-center items-center rounded-lg w-fit gap-2 max-w-[50vw] mx-auto">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className={`w-10 h-10 flex justify-center items-center font-medium transition-all text-gray-600 disabled:text-gray-400 bg-white hover:bg-gray-50 rounded-l-md text-xs border`}
        >
          Prev
        </button>

        {/* Page Number Buttons */}
        {paginationRange.map((page, index) =>
          typeof page === "string" ? (
            <span
              key={index}
              className="w-10 h-10 flex justify-center items-center text-xs font-medium"
            >
              {page}
            </span>
          ) : (
            <button
              key={index}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex justify-center items-center text-xs font-medium transition-all border rounded-lg ${
                page === currentPage
                  ? "bg-basePrimary text-white"
                  : "bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          className={`w-10 h-10 flex justify-center items-center font-medium transition-all text-gray-600 disabled:text-gray-400 bg-white hover:bg-gray-50 rounded-r-md text-xs border`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
