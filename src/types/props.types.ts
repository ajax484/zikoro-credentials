export interface PaginationProps {
  totalDocs: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
}
