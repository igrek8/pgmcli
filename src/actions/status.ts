import pg from "pg";

import { resolve } from "path";
import { Config } from "../core/config.interface.js";
import { DefaultCommandOptions } from "../core/default-command-options.interface.js";
import { getAppliedMigrations } from "../core/get-applied-migrations.js";
import { getMigrations } from "../core/get-migrations.js";

export type StatusOptions = DefaultCommandOptions;

export async function status(options: StatusOptions, config?: Config) {
  const client = new pg.Client({
    ...config?.client,
    host: options.host,
    port: options.port,
    database: options.db,
    user: options.user,
    password: options.password,
  });
  const table = client.escapeIdentifier(options.table);
  try {
    await client.connect();
    try {
      await client.query("BEGIN");
      await client.query(`LOCK TABLE ${table} IN ACCESS EXCLUSIVE MODE`);
      const [applied, migrations] = await Promise.all([
        getAppliedMigrations(client, table),
        getMigrations(resolve(options.dir)),
      ]);
      migrations.forEach(({ id }) => {
        const status = applied.has(id) ? "applied" : "pending";
        const meta = applied.get(id)?.meta;
        let message = `${status}: ${id}`;
        if (meta) message += ` ${JSON.stringify(meta)}`;
        console.info(message);
      });
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }
  } finally {
    await client.end();
  }
}
