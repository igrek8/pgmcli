import { Command } from "commander";

import { Config } from "./config.interface.mjs";
import {
  DEFAULT_TABLE,
  DEFAULT_DIR,
  DEFAULT_CONFIG_PATH,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_USER,
} from "./constants.mjs";
import { parseInt } from "./parse-int.mjs";

export function attachDefaultOptions(cmd: Command, config?: Config) {
  return cmd
    .requiredOption("--host <string>", "postgres host", config?.host ?? DEFAULT_HOST)
    .requiredOption("--port <number>", "postgers port", parseInt, config?.port ?? DEFAULT_PORT)
    .option("-u, --user <string>", "postgres user", config?.user ?? DEFAULT_USER)
    .option("-p, --password <string>", "postgers password")
    .option("--db <name>", "database name", config?.db)
    .requiredOption("--dir <name>", "migrations directory", config?.dir ?? DEFAULT_DIR)
    .requiredOption("--table <name>", "migrations table", config?.table ?? DEFAULT_TABLE)
    .requiredOption("--config <path>", "config path", DEFAULT_CONFIG_PATH);
}
