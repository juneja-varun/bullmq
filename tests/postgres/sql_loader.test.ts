import { describe, expect, it, vi } from 'vitest';
import {
  loadCommandSql,
  loadMigrationSql,
} from '../../src/postgres/sql-loader';

describe('PostgreSQL SQL Loader', () => {
  it('loads migration SQL files without throwing', () => {
    const migration = loadMigrationSql('0001_schema.sql');
    expect(typeof migration).toBe('string');
    expect(migration.length).toBeGreaterThan(0);
    expect(migration).toContain('CREATE TABLE');
  });

  it('loads command SQL files without throwing', () => {
    const command = loadCommandSql('add_job');
    expect(typeof command).toBe('string');
    expect(command.length).toBeGreaterThan(0);
  });

  it('loads SQL with no filesystem access, so it works under single-file bundlers', async () => {
    vi.resetModules();
    const readFileSync = vi.fn(() => {
      throw new Error('fs.readFileSync should never be called');
    });

    vi.doMock('fs', () => ({
      readFileSync,
    }));

    const {
      loadCommandSql: loadCommandSqlFresh,
      loadMigrationSql: loadMigrationSqlFresh,
    } = await import('../../src/postgres/sql-loader');

    expect(loadCommandSqlFresh('add_job').length).toBeGreaterThan(0);
    expect(loadMigrationSqlFresh('0001_schema.sql').length).toBeGreaterThan(0);
    expect(readFileSync).not.toHaveBeenCalled();

    vi.doUnmock('fs');
  });

  it('throws a clear error for an unknown command or migration name', () => {
    expect(() => loadCommandSql('does_not_exist')).toThrow(
      'Unknown Postgres command: does_not_exist',
    );
    expect(() => loadMigrationSql('9999_missing.sql')).toThrow(
      'Unknown Postgres migration: 9999_missing.sql',
    );
  });
});
