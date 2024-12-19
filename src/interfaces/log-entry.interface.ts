export interface LogEntry {
  date: string;
  method: string;
  ip: string;
  user: string;
  path: string;
  query: Record<string, any>;
  body: Record<string, any>;
}
