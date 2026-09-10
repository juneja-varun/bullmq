import { commandSql } from './generated-commands';
import { migrationSql } from './generated-migrations';

/**
 * Loads a migration's SQL by filename — the portable source of truth shared
 * with the Elixir/Python ports. Content is inlined at build time (see
 * `scripts/generateSqlModules.js`) instead of read from disk, so this works
 * unmodified under single-file bundlers (bun build --compile, esbuild
 * --bundle, pkg, deno compile, Node SEA) that don't ship loose `.sql` files.
 */
export function loadMigrationSql(file: string): string {
  const sql = migrationSql[file];
  if (sql === undefined) {
    throw new Error(`Unknown Postgres migration: ${file}`);
  }
  return sql;
}

/**
 * Loads a runtime command's SQL by name (without the `.sql` extension).
 * Each `.sql` file is one parameterized statement, portable verbatim to the
 * Python/Elixir/PHP/Rust ports (mirroring how the Redis backend's `.lua`
 * scripts never hardcode the key prefix).
 */
export function loadCommandSql(name: string): string {
  const sql = commandSql[`${name}.sql`];
  if (sql === undefined) {
    throw new Error(`Unknown Postgres command: ${name}`);
  }
  return sql;
}
