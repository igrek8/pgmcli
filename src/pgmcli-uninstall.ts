#!/usr/bin/env node

import { program } from "commander";

import { uninstall } from "./actions/uninstall.js";
import { attachDefaultOptions } from "./core/attach-default-options.js";
import { resolveConfig } from "./core/resolve-config.js";

const config = await resolveConfig(process.argv);

attachDefaultOptions(program, config)
  .description("drops a migrations table")
  .action(uninstall)
  .parse();
