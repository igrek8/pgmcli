import { Config } from "./config.interface.js";
import { DEFAULT_CONFIG_PATH } from "./constants.js";
import { getConfigPath } from "./get-config-path.js";
import { readConfig } from "./read-config.js";
import { checkFileExists } from "./check-file-exists.js";

export async function resolveConfig(argv: string[]): Promise<Config | undefined> {
  const configPath = getConfigPath(argv) ?? DEFAULT_CONFIG_PATH;
  if (await checkFileExists(configPath)) return readConfig(configPath);
  return undefined;
}
