export interface Migration {
  id: string;
  created_at: number;
  meta?: Record<string, unknown>;
}
