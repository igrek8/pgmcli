import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readJSONFile } from "./read-json-file.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

export const pkg = await readJSONFile(join(__dirname, "..", "..", "package.json"));
