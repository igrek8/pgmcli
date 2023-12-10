import { dirname } from "path";
import { mkdir, writeFile } from "fs/promises";
import { URL } from "url";

import { pkg } from "./pkg-info.js";
import { Config } from "./config.interface.js";
import {
  DEFAULT_HOST,
  DEFAULT_DIR,
  DEFAULT_TABLE,
  DEFAULT_USER,
  DEFAULT_PORT,
  DEFAULT_TAG,
  DEFAULT_LOG_LEVEL,
} from "./constants.js";

const url = new URL(pkg.repository.url);
url.pathname += `/raw/v${pkg.version}/schema.json`;

const config: Config = {
  $schema: url.toString(),
  host: DEFAULT_HOST,
  port: DEFAULT_PORT,
  user: DEFAULT_USER,
  dir: DEFAULT_DIR,
  table: DEFAULT_TABLE,
  logLevel: DEFAULT_LOG_LEVEL,
  tag: DEFAULT_TAG,
};

export async function createConfigFile(configPath: string) {
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2));
}
