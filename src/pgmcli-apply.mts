#!/usr/bin/env node

import { program, Option } from "commander";
import { resolve } from "path";
import { readFile } from "fs/promises";
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
  .description("applies migrations")
  .option("-n <number>", 'apply "n" pending migrations', parseInt, Number.POSITIVE_INFINITY)
  .option("--plan", "show plan")
  .addOption(logLevel)
  .option("--meta <jsonb>", "extra meta associated with apply")
  .option("--tag <name>", "tag where apply block ends", config?.tag ?? DEFAULT_TAG)
  .action(async (options: ApplyOptions) => {
    const db = new pg.Client({
      ...config?.client,
      host: options.host,
      port: options.port,
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
      for (const migration of migrations.values()) {
        try {
          await db.query("BEGIN");
          await db.query(`SET client_min_messages TO ${severity}`);
          await db.query(`LOCK TABLE ${table} IN EXCLUSIVE MODE`);
          const applied = await getAppliedMigrations(db, table);
          checkIntegrity({ applied, migrations });
          if (applied.has(migration.id)) {
            await db.query("ROLLBACK");
            continue;
          }
          if (i++ >= options.n) {
            await db.query("ROLLBACK");
            break;
          }
          console.info(`apply: ${migration.id}`);
          if (!options.plan) {
            const filePath = resolve(options.dir, migration.id);
            if (migration.id.endsWith(".sql")) {
              const content = await readFile(filePath, { encoding: "utf-8" });
              const [up] = content.split(options.tag);
              if (up) {
                await db.query(up);
              }
            } else {
              const { up } = await import(filePath);
              await up?.(db, { logLevel: options.logLevel });
            }
            const row = [migration.id, options.meta];
            await db.query(`INSERT INTO ${table} VALUES ($1, $2)`, row);
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
