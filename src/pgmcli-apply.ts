#!/usr/bin/env node

import { Option, program } from "commander";

import { apply } from "./actions/apply.js";
import { attachDefaultOptions } from "./core/attach-default-options.js";
import { DEFAULT_LOG_LEVEL, DEFAULT_TAG } from "./core/constants.js";
import { LogLevel } from "./core/logging.js";
import { parseInt } from "./core/parse-int.js";
import { resolveConfig } from "./core/resolve-config.js";

const config = await resolveConfig(process.argv);

const logLevel = new Option("--log-level <level>", "log level")
  .choices(Object.keys(LogLevel))
  .default(config?.logLevel ?? DEFAULT_LOG_LEVEL);

attachDefaultOptions(program, config)
  .description("applies migrations")
  .option("-n <number>", 'apply "n" pending migrations', parseInt, Number.POSITIVE_INFINITY)
  .option("--plan", "show plan")
  .addOption(logLevel)
  .option("--meta <jsonb>", "extra meta associated with apply")
  .option("--tag <name>", "tag where apply block ends", config?.tag ?? DEFAULT_TAG)
  .action(apply)
  .parse();
