#!/usr/bin/env node

import { resolve } from "path";
import { readFile } from "fs/promises";
import { program, Option } from "commander";
import pg from "pg";

import "./core/polyfills.mjs";
import { attachDefaultOptions } from "./core/attach-default-options.mjs";
import { DefaultCommandOptions } from "./core/default-command-options.interface.mjs";
import { resolveConfig } from "./core/resolve-config.mjs";
import { getMigrations } from "./core/get-migrations.mjs";
import { DEFAULT_LOG_LEVEL, DEFAULT_TAG } from "./core/constants.mjs";
import { getAppliedMigrations } from "./core/get-applied-migrations.mjs";
import { checkIntegrity } from "./core/check-integrity.mjs";
import { parseInt } from "./core/parse-int.mjs";
import { LogLevel, getChannel, toServerSeverity } from "./core/logging.mjs";

const config = await resolveConfig(process.argv);

interface ApplyOptions extends DefaultCommandOptions {
  plan?: boolean;
  n: number;
  meta?: string;
  tag: string;
  logLevel: LogLevel;
}

const logLevel = new Option("--log-level <level>", "log level")
  .choices(Object.keys(LogLevel))
  .default(config?.logLevel ?? DEFAULT_LOG_LEVEL);

attachDefaultOptions(program, config)
  .description("reverts migrations")
  .requiredOption("-n <number>", 'revert "n" applied migrations', parseInt, 1)
  .option("--plan", "show plan")
  .addOption(logLevel)
  .option("--tag <name>", "tag where revert block begins", config?.tag ?? DEFAULT_TAG)
  .action(async (options: ApplyOptions) => {
    const db = new pg.Client({
      ...config?.client,
      host: options.host,
      port: Number.parseInt(options.port),
      database: options.db,
      user: options.user,
      password: options.password,
    });
    db.on("notice", ({ severity, message }) => {
      const level = getChannel(severity);
      process[level].write(`${message}\n`);
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
          await db.query(`LOCK TABLE ${table} IN EXCLUSIVE MODE`);
          await db.query(`SET client_min_messages TO ${severity}`);
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
              const { down } = await import(filePath);
              await down?.(db, { logLevel: options.logLevel });
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
  })
  .parse();
