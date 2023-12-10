#!/usr/bin/env node

import { Option, program } from "commander";

import { revert } from "./actions/revert.js";
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
  .description("reverts migrations")
  .requiredOption("-n <number>", 'revert "n" applied migrations', parseInt, 1)
  .option("--plan", "show plan")
  .addOption(logLevel)
  .option("--tag <name>", "tag where revert block begins", config?.tag ?? DEFAULT_TAG)
  .action(revert)
  .parse();
