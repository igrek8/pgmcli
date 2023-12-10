import { strict as assert } from "assert";

import { Migration } from "./migration.interface.js";

export interface CheckIntegrityOptions {
  applied: Map<string, Migration>;
  migrations: Map<string, Migration>;
}

export function checkIntegrity({ applied, migrations }: CheckIntegrityOptions) {
  const items = Array.from(migrations.values());
  Array.from(applied.values()).forEach(({ id }, index) => {
    const migration = items.at(index);
    assert(migration, `can't find migration ${id}`);
    assert(migration.id === id, `out of sync migrations`);
  });
}
