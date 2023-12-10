import Ajv from "ajv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { readJSONFile } from "./read-json-file.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

export const ajv = new Ajv.default({ strict: true });

ajv.addSchema(await readJSONFile(join(__dirname, "..", "..", "schema.json")), "#");
