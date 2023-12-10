import { strict as assert } from "assert";
import { readdir } from "fs/promises";
import { Migration } from "./migration.interface.js";
import { sort } from "./sort.js";

export async function getMigrations(migrationsDir: string) {
  return new Map<string, Migration>(
    (await readdir(migrationsDir, { withFileTypes: true }))
      .reduce<[string, Migration][]>((arr, entry) => {
        if (entry.isFile()) {
          const created_at = Number.parseInt(entry.name);
          assert(
            Number.isFinite(created_at),
            `Migration name "${entry.name}" must have a timestamp`,
          );
          arr.push([entry.name, { id: entry.name, created_at }]);
        }
        return arr;
      }, [])
      .sort(([, a], [, b]) => sort(a, b)),
  );
}
