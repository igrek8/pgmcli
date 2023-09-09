# PostgreSQL Migrator

Apply or revert migrations for PostgreSQL.

- [PostgreSQL Migrator](#postgresql-migrator)
  - [Quick start](#quick-start)
  - [Installation](#installation)
  - [Commands](#commands)
    - [Install](#install)
    - [Uninstall](#uninstall)
    - [Create](#create)
    - [Status](#status)
    - [Apply](#apply)
    - [Revert](#revert)

## Quick start

```bash
npx pgmcli -h
```

## Installation

```bash
npm i -g pgmcli
```

```bash
yarn global add pgmcli
```

## Commands

### Install

```
Usage: pgmcli install [options]

creates a migrations table, a directory and a config file

Options:
  --host <string>         postgres host (default: "localhost")
  --port <number>         postgers port (default: 5432)
  -u, --user <string>     postgres user (default: "postgres")
  -p, --password <string>  postgers password
  --db <name>             database name
  --dir <name>            migrations directory (default: "migrations")
  --table <name>          migrations table (default: "migrations")
  --config <path>         config path (default: ".pgmcli")
  -h, --help              display help for command
```

### Uninstall

```
Usage: pgmcli uninstall [options]

drops a migrations table

Options:
  --host <string>         postgres host (default: "localhost")
  --port <number>         postgers port (default: 5432)
  -u, --user <string>     postgres user (default: "postgres")
  -p, --password <string>  postgers password
  --db <name>             database name
  --dir <name>            migrations directory (default: "migrations")
  --table <name>          migrations table (default: "migrations")
  --config <path>         config path (default: ".pgmcli")
  -h, --help              display help for command
```

### Create

```
Usage: pgmcli create [options]

creates a migration

Options:
  --name <name>       migration file name (.ts, .js, .cjs, .mjs, .mts, .sql)
  --plan              show plan
  --dir <name>        migrations directory (default: "migrations")
  --revert-tag <tag>  tag where revert block begins (default: "REVERT BEGIN")
  --config <path>     config path
  -h, --help          display help for command
```

### Status

```
Usage: pgmcli status [options]

shows statuses of migrations

Options:
  --host <string>         postgres host (default: "localhost")
  --port <number>         postgers port (default: 5432)
  -u, --user <string>     postgres user (default: "postgres")
  -p, --password <string>  postgers password
  --db <name>             database name
  --dir <name>            migrations directory (default: "migrations")
  --table <name>          migrations table (default: "migrations")
  --config <path>         config path (default: ".pgmcli")
  -h, --help              display help for command
```

### Apply

```
Usage: pgmcli apply [options]

applies migrations

Options:
  --host <string>         postgres host (default: "localhost")
  --port <number>         postgers port (default: 5432)
  -u, --user <string>     postgres user (default: "postgres")
  -p, --password <string>  postgers password
  --db <name>             database name
  --dir <name>            migrations directory (default: "migrations")
  --table <name>          migrations table (default: "migrations")
  --config <path>         config path (default: ".pgmcli")
  -n <number>             apply "n" pending migrations (default: null)
  --plan                  show plan
  --log-level <level>     log level (choices: "DEBUG", "LOG", "INFO", "NOTICE", "WARNING", "ERROR", default: "log")
  --meta <jsonb>          extra meta associated with apply
  --tag <name>            tag where apply block ends (default: "REVERT BEGIN")
  -h, --help              display help for command
```

### Revert

```
Usage: pgmcli revert [options]

reverts migrations

Options:
  --host <string>         postgres host (default: "localhost")
  --port <number>         postgers port (default: 5432)
  -u, --user <string>     postgres user (default: "postgres")
  -p, --password <string>  postgers password
  --db <name>             database name
  --dir <name>            migrations directory (default: "migrations")
  --table <name>          migrations table (default: "migrations")
  --config <path>         config path (default: ".pgmcli")
  -n <number>             revert "n" applied migrations (default: 1)
  --plan                  show plan
  --log-level <level>     log level (choices: "DEBUG", "LOG", "INFO", "NOTICE", "WARNING", "ERROR", default: "log")
  --tag <name>            tag where revert block begins (default: "REVERT BEGIN")
  -h, --help              display help for command
```
