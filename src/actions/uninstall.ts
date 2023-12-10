import pg from "pg";

import { DefaultCommandOptions } from "../core/default-command-options.interface.js";
import { Config } from "../core/config.interface.js";

export type UninstallOptions = DefaultCommandOptions;

export async function uninstall(options: UninstallOptions, config?: Config) {
  const client = new pg.Client({
    ...config?.client,
    host: options.host,
    port: options.port,
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
}
