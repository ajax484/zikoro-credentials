export interface PaginatedData<T> {
  data: T[];
  limit: number;
  total: number;
  totalPages: number;
  page: number;
}

export interface UpdateData<T> extends Partial<T> {
  id: string;
}
