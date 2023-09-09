#!/usr/bin/env node

import { program } from "commander";
import pg from "pg";

import "./core/polyfills.mjs";
import { attachDefaultOptions } from "./core/attach-default-options.mjs";
import { DefaultCommandOptions } from "./core/default-command-options.interface.mjs";
import { resolveConfig } from "./core/resolve-config.mjs";
import { getAppliedMigrations } from "./core/get-applied-migrations.mjs";
import { getMigrations } from "./core/get-migrations.mjs";
import { resolve } from "path";

const config = await resolveConfig(process.argv);

attachDefaultOptions(program, config)
  .description("shows statuses of migrations")
  .action(async (options: DefaultCommandOptions) => {
    const client = new pg.Client({
      ...config?.client,
      host: options.host,
      port: Number.parseInt(options.port),
      database: options.db,
      user: options.user,
      password: options.password,
    });
    const table = client.escapeIdentifier(options.table);
    try {
      await client.connect();
      await client.query("BEGIN");
      await client.query(`LOCK TABLE ${table} IN EXCLUSIVE MODE`);
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
    } finally {
      await client.query("ROLLBACK");
      await client.end();
    }
  })
  .parse();
