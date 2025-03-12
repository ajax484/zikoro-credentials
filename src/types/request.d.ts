export interface PaginatedData<T> {
  data: T[];
  limit: number;
  total: number;
  totalPages: number;
  page: number;
}
