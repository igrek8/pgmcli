import { ajv } from "./ajv.js";

export function isValidConfig(config: unknown): boolean {
  return ajv.validate("#", config);
}
