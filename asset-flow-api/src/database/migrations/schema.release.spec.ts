import { PGlite } from '@electric-sql/pglite';
import { ReleaseHardwareAndAccounts1794528000000 } from './1794528000000-ReleaseHardwareAndAccounts';

describe('Release migration on embedded PostgreSQL', () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    // Representative older tables, including mixed-case and ambiguous legacy emails.
    await db.exec(`CREATE TABLE employee(id serial PRIMARY KEY,email text,deleted_at timestamp);
      CREATE TABLE users(id serial PRIMARY KEY,email text,deleted_at timestamp);
      CREATE TABLE asset(id serial PRIMARY KEY);
      INSERT INTO employee(email) VALUES ('match@example.com'),('ambiguous@example.com'),(' AMBIGUOUS@example.com ');
      INSERT INTO users(email) VALUES (' MATCH@example.com '),('ambiguous@example.com'),('standalone@example.com');
      INSERT INTO asset DEFAULT VALUES; INSERT INTO asset DEFAULT VALUES; INSERT INTO asset DEFAULT VALUES; INSERT INTO asset DEFAULT VALUES;`);
    await new ReleaseHardwareAndAccounts1794528000000().up({
      query: async (sql: string, params?: unknown[]) => {
        return (await db.query(sql, params)).rows;
      },
    } as any);
  });
  afterAll(async () => {
    await db?.close();
  });
  it('links only unambiguous accounts and denies account-management by default', async () => {
    const { rows } = await db.query<any>(
      'SELECT employee_id,can_manage_accounts,must_change_password,token_version FROM users ORDER BY id',
    );
    expect(rows.map((r) => r.employee_id)).toEqual([1, null, null]);
    expect(
      rows.every(
        (r) =>
          r.can_manage_accounts === false &&
          r.must_change_password === false &&
          r.token_version === 0,
      ),
    ).toBe(true);
  });
  it('prevents duplicate employee accounts at the database level', async () => {
    await expect(
      db.query('UPDATE users SET employee_id=1 WHERE id=3'),
    ).rejects.toMatchObject({ code: '23505' });
  });
  it('allows multiple monitors on one desktop, prevents sharing and self-links', async () => {
    await db.query(
      'INSERT INTO asset_monitor_assignments(desktop_asset_id,monitor_asset_id) VALUES(1,2),(1,3)',
    );
    await expect(
      db.query(
        'INSERT INTO asset_monitor_assignments(desktop_asset_id,monitor_asset_id) VALUES(4,2)',
      ),
    ).rejects.toMatchObject({ code: '23505' });
    await expect(
      db.query(
        'INSERT INTO asset_monitor_assignments(desktop_asset_id,monitor_asset_id) VALUES(4,4)',
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });
  it('requires detachment before deleting a monitor or desktop', async () => {
    await expect(
      db.query('DELETE FROM asset WHERE id=1'),
    ).rejects.toMatchObject({ code: '23001' });
    await expect(
      db.query('DELETE FROM asset WHERE id=2'),
    ).rejects.toMatchObject({ code: '23001' });
  });
  it('rolls back partial assignment writes', async () => {
    await expect(
      db.transaction(async (tx) => {
        await tx.query(
          'DELETE FROM asset_monitor_assignments WHERE monitor_asset_id=2',
        );
        await tx.query(
          'INSERT INTO asset_monitor_assignments(desktop_asset_id,monitor_asset_id) VALUES(4,999)',
        );
      }),
    ).rejects.toMatchObject({ code: '23503' });
    expect(
      (
        await db.query(
          'SELECT 1 FROM asset_monitor_assignments WHERE monitor_asset_id=2',
        )
      ).rows,
    ).toHaveLength(1);
  });
});
