import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

import { Button, showToast } from "@quillsocial/ui";

// Cast Button to fix TypeScript JSX issue
const SafeButton = Button as any;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  itemsPerPage: number;
  totalItems: number;
}) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  const paginationRange = [...Array(endPage - startPage + 1)].map(
    (_, i) => startPage + i
  );
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);
  return (
    <nav className="flex items-center justify-center border-gray-200 px-4  sm:px-0">
      {/* <div className="mr-auto text-sm">
                Showing
                <span className="font-bold ml-1 mr-[2px]">{startIndex}</span> to
                <span className="font-bold ml-1 mr-[2px]">{endIndex}</span>   of
                <span className="font-bold ml-1 mr-[2px]">{totalItems}</span> results
            </div> */}
      <div className="flex w-[550px] justify-between">
        {/* <div className="flex w-full justify-center sm:justify-center"></div> */}
        <div className="flex items-center justify-center">
          <SafeButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="mx-2 mb-2 mr-1 inline-flex items-center py-2 mt-2 sm:mt-0 text-sm font-medium text-white hover:border-gray-300 hover:text-white sm:mb-0 sm:mr-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </SafeButton>
          {currentPage > 3 && (
            <SafeButton
              onClick={() => handlePageChange(1)}
              className="ml-1 inline-flex items-center border-t-2 border-transparent bg-white pr-1 pt-4 text-sm font-medium text-gray-500 hover:text-white"
            >
              1...
            </SafeButton>
          )}
          {paginationRange.map((page) => (
            <SafeButton
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 inline-flex items-center bg-white hover:text-white ${
                currentPage === page
                  ? "bg-awst text-white"
                  : "border-transparent text-gray-500"
              } px-4 pt-4 text-sm font-medium`}
            >
              {page}
            </SafeButton>
          ))}
          {currentPage < totalPages - 2 && (
            <SafeButton
              onClick={() => handlePageChange(totalPages)}
              className="inline-flex items-center border-transparent bg-white pl-1 pt-4 text-sm font-medium text-gray-500 hover:text-white"
            >
              ...{totalPages}
            </SafeButton>
          )}
          <SafeButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="mx-2 ml-auto items-center py-4 pl-4 text-sm font-medium text-white hover:text-white"
          >
            <ArrowRight className="h-5 w-5" />
          </SafeButton>
        </div>
        {/* <div className="ml-auto flex w-full items-center justify-center sm:items-end sm:justify-end"></div> */}
      </div>
    </nav>
  );
}
