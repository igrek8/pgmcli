#!/usr/bin/env node

import { program } from "commander";

import "./core/polyfills.mjs";
import { pkg } from "./core/pkg-info.mjs";

program
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)
  .command("install", "create migrations table")
  .command("uninstall", "drop migrations table")
  .command("status", "show status")
  .command("create", "create migration")
  .command("apply", "apply migrations")
  .command("revert", "revert migrations")
  .action(() => program.help())
  .parse();
