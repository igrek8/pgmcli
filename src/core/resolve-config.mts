import { Config } from "./config.interface.mjs";
import { DEFAULT_CONFIG_PATH } from "./constants.mjs";
import { getConfigPath } from "./get-config-path.mjs";
import { readConfig } from "./read-config.mjs";
import { checkFileExists } from "./check-file-exists.mjs";

export async function resolveConfig(argv: string[]): Promise<Config | undefined> {
  const configPath = getConfigPath(argv) ?? DEFAULT_CONFIG_PATH;
  if (await checkFileExists(configPath)) return readConfig(configPath);
  return undefined;
}
