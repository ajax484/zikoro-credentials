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
                  onClick={() => onClick(row.original)}
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
  const totalPages = Math.ceil(totalDocs / limit); // Assuming 10 is your limit

  return (
    <div className="mt-4 flex justify-center">
      <div className="flex justify-center items-center rounded-lg w-fit gap-2">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
          }}
          className={`w-10 h-10 flex justify-center items-center font-medium transition-all text-gray-600 disabled:text-gray-400 bg-white hover:bg-gray-50 rounded-l-md text-xs border`}
        >
          Prev
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentPage(index + 1);
            }}
            className={`w-10 h-10 flex justify-center items-center text-xs font-medium transition-all border rounded-md ${
              index + 1 === currentPage
                ? "bg-basePrimary text-white"
                : "bg-white hover:bg-gray-50 text-gray-600"
            }`}
          >
            {index + 1}
          </button>
        ))}

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
          }}
          className={`w-10 h-10 flex justify-center items-center font-medium transition-all text-gray-600 disabled:text-gray-400 bg-white hover:bg-gray-50 rounded-r-md text-xs border`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
