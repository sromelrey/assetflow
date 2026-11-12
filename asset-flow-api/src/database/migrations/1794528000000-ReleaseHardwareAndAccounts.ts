import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReleaseHardwareAndAccounts1794528000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE users
      ADD COLUMN employee_id integer UNIQUE REFERENCES employee(id) ON DELETE RESTRICT,
      ADD COLUMN must_change_password boolean NOT NULL DEFAULT false,
      ADD COLUMN temporary_password_expires_at timestamptz,
      ADD COLUMN token_version integer NOT NULL DEFAULT 0,
      ADD COLUMN can_manage_accounts boolean NOT NULL DEFAULT false`);
    // Only unambiguous, non-deleted matches. Unmatched users remain valid standalone accounts.
    await q.query(`UPDATE users u SET employee_id=e.id FROM employee e
      WHERE u.deleted_at IS NULL AND e.deleted_at IS NULL AND NULLIF(TRIM(e.email),'') IS NOT NULL
      AND LOWER(TRIM(u.email))=LOWER(TRIM(e.email))
      AND (SELECT COUNT(*) FROM users u2 WHERE u2.deleted_at IS NULL AND LOWER(TRIM(u2.email))=LOWER(TRIM(e.email)))=1
      AND (SELECT COUNT(*) FROM employee e2 WHERE e2.deleted_at IS NULL AND LOWER(TRIM(e2.email))=LOWER(TRIM(e.email)))=1`);
    await q.query(`CREATE TABLE account_action_audit (
      id bigserial PRIMARY KEY, actor_id integer NOT NULL, target_id integer NOT NULL,
      action varchar(40) NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE TABLE asset_monitor_assignments (
      id bigserial PRIMARY KEY,
      desktop_asset_id integer NOT NULL REFERENCES asset(id) ON DELETE RESTRICT,
      monitor_asset_id integer NOT NULL UNIQUE REFERENCES asset(id) ON DELETE RESTRICT,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT monitor_not_self CHECK(desktop_asset_id<>monitor_asset_id))`);
    await q.query(
      'CREATE INDEX idx_monitor_desktop ON asset_monitor_assignments(desktop_asset_id)',
    );
  }
  async down(): Promise<void> {
    throw new Error(
      'This migration contains account and assignment data. Use the documented recovery procedure; do not drop production data automatically.',
    );
  }
}
