export interface ErrorEntry {
  date: string;
  method: string;
  ip: string;
  user: string;
  path: string;
  statusCode: number;
  error: any;
  responseTime: number;
}
