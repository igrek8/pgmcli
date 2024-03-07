import { readFile } from "fs/promises";
import { resolve } from "path";
import pg from "pg";

import { checkIntegrity } from "../core/check-integrity.js";
import { Config } from "../core/config.interface.js";
import { DefaultCommandOptions } from "../core/default-command-options.interface.js";
import { getAppliedMigrations } from "../core/get-applied-migrations.js";
import { getMigrations } from "../core/get-migrations.js";
import { LogLevel, getConsoleLevel, toServerSeverity } from "../core/logging.js";

export interface RevertOptions extends DefaultCommandOptions {
  plan?: boolean;
  n: number;
  meta?: string;
  tag: string;
  logLevel: LogLevel;
}

export async function revert(options: RevertOptions, config?: Config) {
  const db = new pg.Client({
    ...config?.client,
    host: options.host,
    port: options.port,
    database: options.db,
    user: options.user,
    password: options.password,
  });
  db.on("notice", ({ severity, message }) => {
    const level = getConsoleLevel(severity);
    console[level](message);
  });
  try {
    await db.connect();
    let i = 0;
    const table = db.escapeIdentifier(options.table);
    const severity = toServerSeverity(options.logLevel);
    const migrations = await getMigrations(resolve(options.dir));
    for (const migration of Array.from(migrations.values()).reverse()) {
      try {
        await db.query("BEGIN");
        await db.query(`SET client_min_messages TO ${severity}`);
        await db.query(`LOCK TABLE ${table} IN ACCESS EXCLUSIVE MODE`);
        const applied = await getAppliedMigrations(db, table);
        checkIntegrity({ applied, migrations });
        if (!applied.has(migration.id)) {
          await db.query("ROLLBACK");
          continue;
        }
        if (i++ >= options.n) {
          await db.query("ROLLBACK");
          break;
        }
        console.info(`revert: ${migration.id}`);
        if (!options.plan) {
          const filePath = resolve(options.dir, migration.id);
          if (migration.id.endsWith(".sql")) {
            const content = await readFile(filePath, { encoding: "utf-8" });
            const [, down] = content.split(options.tag);
            if (down) {
              await db.query(down);
            }
          } else {
            const module = await import(filePath);
            await (module.down ?? module.default.down)?.(db, { logLevel: options.logLevel });
          }
          await db.query(`DELETE FROM ${table} WHERE id = $1`, [migration.id]);
        }
        await db.query("COMMIT");
      } catch (e) {
        await db.query("ROLLBACK");
        throw e;
      }
    }
  } finally {
    await db.end();
  }
}
