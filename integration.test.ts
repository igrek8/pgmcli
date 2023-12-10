import fs from "fs/promises";
import { Client } from "pg";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { apply } from "./src/actions/apply.js";
import { create } from "./src/actions/create.js";
import { install } from "./src/actions/install.js";
import { revert } from "./src/actions/revert.js";
import { status } from "./src/actions/status.js";
import { uninstall } from "./src/actions/uninstall.js";
import {
  DEFAULT_CONFIG_PATH,
  DEFAULT_DIR,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_TABLE,
  DEFAULT_TAG,
  DEFAULT_USER,
} from "./src/core/constants.js";
import { DefaultCommandOptions } from "./src/core/default-command-options.interface.js";
import { LogLevel } from "./src/core/logging.js";
import { resolveConfig } from "./src/core/resolve-config.js";

const config = await resolveConfig(process.argv);

const pg = new Client({
  host: process.env.POSTGRES_HOST ?? DEFAULT_HOST,
  port: config?.port ?? DEFAULT_PORT,
  user: "postgres",
  password: "postgres",
});

const defaultOptions: DefaultCommandOptions = {
  config: DEFAULT_CONFIG_PATH,
  dir: config?.dir ?? DEFAULT_DIR,
  table: config?.table ?? DEFAULT_TABLE,
  host: process.env.POSTGRES_HOST ?? config?.host ?? DEFAULT_HOST,
  port: config?.port ?? DEFAULT_PORT,
  user: config?.user ?? DEFAULT_USER,
  password: config?.password,
  db: config?.db,
};

beforeAll(async () => {
  await pg.connect();
  await fs.rm(defaultOptions.dir, { recursive: true }).catch(() => {});
  await fs.mkdir(defaultOptions.dir, { recursive: true });
  await pg.query("DROP TABLE IF EXISTS migrations");
});

afterAll(async () => {
  await pg.end();
});

async function exists(table: string) {
  const { rows } = await pg.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      ) AS exists
    `,
    [table],
  );
  return rows.at(0)?.exists;
}

async function getMigration(id: string): Promise<object | undefined> {
  const { rows } = await pg.query("SELECT * FROM migrations WHERE id LIKE $1", [`%_${id}`]);
  return rows.at(0);
}

test("integration test", async () => {
  const consoleInfo = vi.spyOn(console, "info");
  const consoleLog = vi.spyOn(console, "log");

  await expect(install(defaultOptions, config)).resolves.not.toThrowError();
  await expect(exists("migrations"), "expected migrations table to exist").resolves.toBe(true);

  await expect(
    create(
      {
        ...defaultOptions,
        name: "migration_1.sql",
        tag: DEFAULT_TAG,
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenLastCalledWith(expect.stringContaining("migration_1.sql"));

  await expect(
    create(
      {
        ...defaultOptions,
        name: "migration_2.ts",
        tag: DEFAULT_TAG,
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenLastCalledWith(expect.stringContaining("migration_2.ts"));

  await expect(status(defaultOptions, config)).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_1.sql/));
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_2.ts/));

  await expect(
    apply(
      {
        ...defaultOptions,
        n: 1,
        logLevel: LogLevel.LOG,
        tag: DEFAULT_TAG,
        meta: '{ "no": 1 }',
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleLog).toHaveBeenLastCalledWith(expect.stringContaining("Applying"));
  await expect(getMigration("migration_1.sql")).resolves.toMatchObject({ meta: { no: 1 } });

  await expect(status(defaultOptions, config)).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/applied: \d+_migration_1.sql/));
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_2.ts/));

  await expect(
    apply(
      {
        ...defaultOptions,
        n: 1,
        logLevel: LogLevel.LOG,
        tag: DEFAULT_TAG,
        meta: '{ "no": 2 }',
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleLog).toHaveBeenLastCalledWith(expect.stringContaining("Applying"));
  await expect(getMigration("migration_2.ts")).resolves.toMatchObject({ meta: { no: 2 } });

  await expect(status(defaultOptions, config)).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/applied: \d+_migration_1.sql/));
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/applied: \d+_migration_2.ts/));

  await expect(
    revert(
      {
        ...defaultOptions,
        n: 1,
        logLevel: LogLevel.LOG,
        tag: DEFAULT_TAG,
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleLog).toHaveBeenLastCalledWith(expect.stringContaining("Reverting"));

  await expect(status(defaultOptions, config)).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/applied: \d+_migration_1.sql/));
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_2.ts/));

  await expect(
    revert(
      {
        ...defaultOptions,
        n: 1,
        logLevel: LogLevel.LOG,
        tag: DEFAULT_TAG,
      },
      config,
    ),
  ).resolves.not.toThrowError();
  expect(consoleLog).toHaveBeenLastCalledWith(expect.stringContaining("Reverting"));

  await expect(status(defaultOptions, config)).resolves.not.toThrowError();
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_1.sql/));
  expect(consoleInfo).toHaveBeenCalledWith(expect.stringMatching(/pending: \d+_migration_2.ts/));

  await expect(uninstall(defaultOptions, config)).resolves.not.toThrowError();
  await expect(exists("migrations"), "expected migrations table to not exist").resolves.toBe(false);
});
