import { mkdir } from "fs/promises";
import pg from "pg";

import { checkFileExists } from "../core/check-file-exists.js";
import { createConfigFile } from "../core/create-config-file.js";
import { DefaultCommandOptions } from "../core/default-command-options.interface.js";
import { Config } from "../core/config.interface.js";

export type InstallOptions = DefaultCommandOptions;

const sql = `
  CREATE TABLE <table> (
    id VARCHAR PRIMARY KEY,
    meta JSONB CHECK (jsonb_typeof(meta) = 'object')
  );
`;

export async function install(options: InstallOptions, config?: Config) {
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
    const hasConfig = await checkFileExists(options.config);
    if (!hasConfig) await createConfigFile(options.config);
    await client.connect();
    await client.query(sql.replace("<table>", table));
    await mkdir(options.dir, { recursive: true });
  } finally {
    await client.end();
  }
}
