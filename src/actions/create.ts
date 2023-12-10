import { strict as assert } from "assert";
import { mkdir, writeFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";

import { Config } from "../core/config.interface.js";

const TS = `import type { Client } from "pg";

export async function up(db: Client, _: { logLevel: string }) {
  console.log("Applying");
}

export async function down(db: Client, _: { logLevel: string }) {
  console.log("Reverting");
}
`;

const ESM = `/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
export async function up(db) {
  console.log("Applying");
}

/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
export async function down(db) {
  console.log("Reverting");
}
`;

const CJS = `/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
async function up(db) {
  console.log("Applying");
}

/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
async function down(db) {
  console.log("Reverting");
}

module.exports = { up, down };
`;

const SQL = `DO $$
BEGIN
  RAISE LOG 'Applying';
END $$;

-- DO NOT REMOVE - THIS LINE SEPARATES APPLY AND REVERT OPERATIONS. <revert_tag>

DO $$
BEGIN
  RAISE LOG 'Reverting';
END $$;
`;

export const templates: Record<string, string> = {
  ".ts": TS,
  ".js": CJS,
  ".cjs": CJS,
  ".mjs": ESM,
  ".mts": TS,
  ".sql": SQL,
};

export interface CreateOptions {
  name: string;
  dir: string;
  plan?: boolean;
  tag: string;
}

const extensions = Object.keys(templates).join(", ");

export async function create(options: CreateOptions, _config?: Config) {
  const fileExtension = extname(options.name);
  const fileName = basename(options.name, fileExtension);
  const fileContent = templates[fileExtension]?.replace("<revert_tag>", options.tag);
  assert(fileContent, `supported extensions ${extensions}`);
  const timestamp = Date.now();
  const outputFileName = `${timestamp}_${fileName}${fileExtension}`;
  const outputFilePath = join(options.dir, outputFileName);
  await mkdir(dirname(outputFilePath), { recursive: true });
  if (!options.plan) await writeFile(outputFilePath, fileContent);
  console.info(`created: ${outputFilePath}`);
}
