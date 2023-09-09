import { ajv } from "./ajv.mjs";

export function isValidConfig(config: unknown): boolean {
  return ajv.validate("#", config);
}
