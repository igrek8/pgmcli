#!/usr/bin/env node

import { program } from "commander";

import { install } from "./actions/install.js";
import { attachDefaultOptions } from "./core/attach-default-options.js";
import { resolveConfig } from "./core/resolve-config.js";

const config = await resolveConfig(process.argv);

attachDefaultOptions(program, config)
  .description("creates a migrations table, a directory and a config file")
  .action(install)
  .parse();
