#!/usr/bin/env node

import { program } from "commander";
import pg from "pg";
import { mkdir } from "fs/promises";

import "./core/polyfills.mjs";
import { attachDefaultOptions } from "./core/attach-default-options.mjs";
import { DefaultCommandOptions } from "./core/default-command-options.interface.mjs";
import { resolveConfig } from "./core/resolve-config.mjs";
import { checkFileExists } from "./core/check-file-exists.mjs";
import { createConfigFile } from "./core/create-config-file.mjs";

const config = await resolveConfig(process.argv);

const sql = `
  CREATE TABLE <table> (
    id VARCHAR PRIMARY KEY,
    meta JSONB CHECK (jsonb_typeof(meta) = 'object')
  );
`;

attachDefaultOptions(program, config)
  .description("creates a migrations table, a directory and a config file")
  .action(async (options: DefaultCommandOptions) => {
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
      await client.query(sql.replace("<table>", table));
      await mkdir(options.dir, { recursive: true });
      const hasConfig = await checkFileExists(options.config);
      if (!hasConfig) await createConfigFile(options.config);
    } finally {
      await client.end();
    }
  })
  .parse();
