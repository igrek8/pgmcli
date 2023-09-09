#!/usr/bin/env node

import { basename, extname, resolve, join, dirname } from "path";
import { program } from "commander";
import { strict as assert } from "assert";
import { mkdir, writeFile } from "fs/promises";

import "./core/polyfills.mjs";
import { DEFAULT_DIR, DEFAULT_TAG } from "./core/constants.mjs";
import { resolveConfig } from "./core/resolve-config.mjs";

const TS = `import type { Client } from "pg";

export async function up(db: Client, _: { logLevel: string }) {
  // Apply change
}

export async function down(db: Client, _: { logLevel: string }) {
  // Revert change
}
`;

const ESM = `/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
export async function up(db) {
  // Apply change
}

/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
export async function down(db) {
  // Revert change
}
`;

const CJS = `/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
async function up(db) {
  // Apply change
}

/**
 * @param {import('pg').Client} db
 * @param {{ logLevel: string }} options
 */
async function down(db) {
  // Revert change
}

module.exports = { up, down };
`;

const SQL = `DO $$
DECLARE
  timestamp TIMESTAMP := NOW();
BEGIN
  RAISE LOG '[%] Applying...', timestamp;
END $$;

-- DO NOT REMOVE - THIS LINE SEPARATES APPLY AND REVERT OPERATIONS. ${DEFAULT_TAG}

DO $$
DECLARE
  timestamp TIMESTAMP := NOW();
BEGIN
  RAISE LOG '[%] Reverting...', timestamp;
END $$;
`;

const templates: Record<string, string> = {
  ".ts": TS,
  ".js": CJS,
  ".cjs": CJS,
  ".mjs": ESM,
  ".mts": TS,
  ".sql": SQL,
};

interface CreateOptions {
  name: string;
  dir: string;
  plan?: boolean;
  revertTag: string;
}

const config = await resolveConfig(process.argv);

const extensions = Object.keys(templates).join(", ");

program
  .description("creates a migration")
  .requiredOption("--name <name>", `migration file name (${extensions})`)
  .option("--plan", "show plan")
  .requiredOption("--dir <name>", "migrations directory", config?.dir ?? DEFAULT_DIR)
  .requiredOption("--revert-tag <tag>", "tag where revert block begins", config?.tag ?? DEFAULT_TAG)
  .option("--config <path>", "config path")
  .action(async (options: CreateOptions) => {
    const fileExtension = extname(options.name);
    const fileName = basename(options.name, fileExtension);
    const fileContent = templates[fileExtension]?.replace(DEFAULT_TAG, options.revertTag);
    assert(fileContent, `supported extensions ${extensions}`);
    const timestamp = Date.now();
    const outputFileName = `${timestamp}_${fileName}${fileExtension}`;
    const outputFilePath = join(options.dir, outputFileName);
    await mkdir(dirname(outputFilePath), { recursive: true });
    if (!options.plan) await writeFile(outputFilePath, fileContent);
    console.info(`created: ${outputFilePath}`);
  })
  .parse();
