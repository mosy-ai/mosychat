"use client";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Separator } from "@/components/ui/separator";
import { useFeedbacks } from "@/hooks/use-feedbacks";
import { FeedbacksTable } from "./feedbacks-table";
import { FeedbacksFilters } from "./feedbacks-filters";
import { FeedbacksPagination } from "./feedbacks-pagination";

export function FeedbacksList() {
  const {
    data,
    pageCount,
    isLoading,
    pagination,
    filters,
    filterOptions,
    handleFilterChange,
    handlePaginationChange,
    exportData,
  } = useFeedbacks();

  const table = useReactTable({
    data,
    columns: [], // Columns are defined in the FeedbacksTable component
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: (updaterOrValue) => {
      // updaterOrValue can be a value or an updater function
      if (typeof updaterOrValue === "function") {
        // If it's a function, call it with the current pagination to get the new value
        handlePaginationChange(updaterOrValue(pagination));
      } else {
        // If it's a value, just pass it along
        handlePaginationChange(updaterOrValue);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="container mx-auto p-4 md:p-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
        Feedback List
      </h1>
      <p className="text-muted-foreground mt-2">
        A list of user feedback with server-side sorting and filtering.
      </p>
      <Separator className="my-6" />

      <FeedbacksFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onExport={exportData}
        isLoading={isLoading}
      />

      <FeedbacksTable data={data} isLoading={isLoading} />

      <FeedbacksPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
      />
    </div>
  );
} 