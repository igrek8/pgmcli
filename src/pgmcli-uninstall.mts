#!/usr/bin/env node

import { program } from "commander";
import pg from "pg";

import "./core/polyfills.mjs";
import { attachDefaultOptions } from "./core/attach-default-options.mjs";
import { DefaultCommandOptions } from "./core/default-command-options.interface.mjs";
import { resolveConfig } from "./core/resolve-config.mjs";

const config = await resolveConfig(process.argv);

attachDefaultOptions(program, config)
  .description("drops a migrations table")
  .action(async (options: DefaultCommandOptions) => {
    const client = new pg.Client({
      ...config?.client,
      host: options.host,
      port: Number.parseInt(options.port),
      database: options.db,
      user: options.user,
      password: options.password,
    });
    try {
      await client.connect();
      const table = client.escapeIdentifier(options.table);
      await client.query(`DROP TABLE ${table}`);
    } finally {
      await client.end();
    }
  })
  .parse();
