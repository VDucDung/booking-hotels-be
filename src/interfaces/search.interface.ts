export interface QueryParams {
  limit?: number;
  page?: number;
  keyword?: string;
  sortBy?: string;
  [key: string]: any;
}

export interface DetailResult {
  limit: number;
  totalResult: number;
  totalPage: number;
  currentPage: number;
  currentResult: number;
}
