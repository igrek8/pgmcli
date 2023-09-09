import { Config } from "./config.interface.mjs";
import { isValidConfig } from "./is-valid-config.mjs";
import { readJSONFile } from "./read-json-file.mjs";

export async function readConfig(configPath: string): Promise<Config> {
  const config = await readJSONFile(configPath);
  if (isValidConfig(config)) return config;
  throw new Error(`Invalid config ${configPath}`);
}
