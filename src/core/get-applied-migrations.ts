import pg from "pg";
import { strict as assert } from "assert";
import { Migration } from "./migration.interface.js";
import { sort } from "./sort.js";

export async function getAppliedMigrations(client: pg.Client, table: string) {
  return new Map<string, Migration>(
    (await client.query<Migration>(`SELECT * FROM ${table}`)).rows
      .map<[string, Migration]>(({ id, created_at, meta }) => {
        const timestamp = Number.parseInt(id);
        assert(Number.isFinite(timestamp));
        return [id, { id, created_at, meta }];
      })
      .sort(([, a], [, b]) => sort(a, b)),
  );
}
