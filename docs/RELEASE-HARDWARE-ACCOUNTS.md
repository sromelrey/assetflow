# Employee accounts and hardware release

Implemented against source commit `bb1e060` on 13 November 2026. Development is in the local workspace copy of assetflow. The original network repository and production database have not been changed.

## Included changes

- Employee rows show Upgrade or Reset Password using a persistent employee-account link. Existing employment status remains separate from account activity.
- Temporary passwords are random, shown once, expire after 24 hours, and require a new password at sign-in. Reset invalidates existing sessions. Administrators cannot reset their own account through the operator action; use Change Password or another administrator.
- Account-management actions require an explicit server-side permission. Ordinary authenticated users cannot call them. The API now requires a valid login for business endpoints that previously had no local guard.
- Employee search includes last name, full name, email, and position. Status headers support both sort directions on the complete fetched list before pagination.
- Add/Edit Hardware includes the selected components and Others, monitor asset selection, charger for Laptop/Mobile/NOC, and OCS Link. Metadata merges preserve unrelated existing keys.
- Existing desktop mouse/keyboard flags are read as a fallback and synchronized when components are saved. Antivirus remains available. Invalid legacy status options in Add/Edit were aligned to the API's existing enum.
- Monitors remain independent asset records, with one desktop assignment per monitor. Detach before changing linked categories or deleting linked assets.
- Both QR interfaces include GK420t 2 by 1 inch and custom-size printing. Existing A4/PDF controls remain. Label printing uses the installed driver and browser dialog; direct/silent ZPL printing is not included.
- Metadata-only components do not create assets or consume inventory. Asset creation and stock decrement now participate in the same transaction.

## Database migration

New migration: `1794528000000-ReleaseHardwareAndAccounts.ts`.

| Database change | Purpose |
|---|---|
| users.employee_id | Nullable unique employee reference, RESTRICT deletion. Standalone accounts remain supported. |
| users.must_change_password | Required first-login password change. Existing accounts default false. |
| users.temporary_password_expires_at | Expiration of temporary credentials. |
| users.token_version | Invalidation of previously issued access and refresh tokens. |
| users.can_manage_accounts | Explicit account-management grant, default false for everyone. |
| account_action_audit | Successful upgrade, reset, and password-change actor/target/time; no secrets. |
| asset_monitor_assignments | Multiple monitors per desktop, unique monitor reference, foreign keys and self-link check. |

Components, charger, and OCS use existing `asset_details.metadata`. No new hardware columns are required. Local print settings use a versioned browser storage key.

Run `asset-flow-api/scripts/release-preflight.sql` read-only against staging/restored data first. Review duplicate normalized emails before migration. The migration links only unambiguous non-deleted employee/user matches. Unresolved matches remain marked for review in the UI; no users are silently merged or deleted.

The migration deliberately does not assign account-management authority automatically. After verifying an operator's identity and user ID, an authorized database operator must grant it explicitly in the deployment transaction, for example:

```sql
-- Replace the example ID only after verifying the intended account.
UPDATE users SET can_manage_accounts = TRUE WHERE id = 123 AND deleted_at IS NULL;
```

The example is not a grant request and has not been executed. Verify that the intended row exists, back up grant values, and record who authorized the grant. Keep at least one verified operator available after the deployment.

Do not use `seed:admin`, `db:reset`, or TypeORM synchronize as the release migration procedure. The legacy seed script enables schema synchronization and is unsuitable for this production update.

## API changes

- Employee arrays gain `userAccount` and `accountLinkNeedsReview`; existing response shape stays an array.
- Upgrade keeps its existing URL and returns sanitized account fields plus `temporaryPassword` once.
- `POST /user/:id/reset-password` returns `{ id, temporaryPassword }` once. It does not activate an inactive account.
- `POST /auth/change-password` accepts `{ currentPassword, newPassword }`. New passwords must be at least 12 characters. On success, sign in again.
- Asset create/update accepts `monitorAssetIds`. Empty detaches all; omission preserves assignments. Only Desktop to Monitor category links are supported.
- Asset update accepts `expectedUpdatedAt`. The updated portal sends it; a stale edit is rejected with a reload message.
- Asset details return `monitors` summaries. `GET /asset/monitor-candidates?search=&cursor=&desktopId=` retrieves eligible monitors in pages of 50, ordered by ascending ID.
- Metadata patches support components, chargerIncluded and ocsLink. Empty components clears the list; empty/null OCS clears the URL; omitted keys stay unchanged; explicit false stays false.
- Account list/detail/profile responses exclude password and refresh-token hashes. Account credential responses use no-store caching.

Older tokens lacking tokenVersion are intentionally rejected. Plan one fresh sign-in for all users when the new API goes live. Upgrade and reset UI query results are cleared after transferring the temporary password into the open-only dialog.

## Local verification

Verified in this implementation run: API compilation, portal production build and TypeScript checks, 30 backend tests across four suites, and the headless Chrome smoke test. Scoped lint checks pass for the new UI controls/modals/employee screen and the core changed account/asset services. Repository-wide lint cleanup is not claimed. The generated release patch is checked with git apply --check against the unchanged source commit.

Use the locked pnpm dependencies. The API adds PGlite as a test-only dependency and promotes the existing tsconfig-paths package to runtime dependencies for compiled import resolution.

```text
asset-flow-api:
  pnpm install --frozen-lockfile
  pnpm build
  pnpm test:release

asset-flow-portal:
  pnpm install --frozen-lockfile
  pnpm exec tsc --noEmit
  pnpm build
```

The production startup and migration scripts register compiled @/ import paths. The compiled migration configuration has been loaded locally without connecting to a database.

The repeatable browser check is `verification/ui-smoke.cjs`. Provide Playwright through the PLAYWRIGHT_MODULE environment variable or a normal package install; it uses installed Chrome in headless mode. Run the portal on localhost:3100 with NEXT_PUBLIC_APP_URL set to a test HTTPS address. The script intercepts API calls, so it does not contact or modify production data. It covers employee actions/search, component/custom-entry create payloads, existing monitor edit/detach payloads, and label unit conversion/preview.

Automated database checks use embedded PostgreSQL with representative older tables. They exercise the new migration, unambiguous account matching, defaults, unique references, foreign keys, self-link rejection, and transactional rollback. They do not prove live multi-process concurrency or compatibility with an actual production backup.

## Staging and deployment requirements

1. Back up the database and restore it into an isolated staging database. Inspect actual schema, previous migration history, category names, and operator accounts. Default category matching uses trimmed, case-insensitive Desktop, Monitor, Laptop, Mobile, and NOC names; confirm these match the deployed records before rollout.
2. Set DATABASE_URL and the existing JWT secrets securely. Supply NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL for the deployed portal. No production credentials were copied into this development workspace.
3. Build and run all checks, then run `pnpm migration:run` in a TypeScript development environment or `pnpm migration:run:prod` using compiled artifacts. Verify PostgreSQL SSL settings for the deployment: the legacy CLI uses SSL while the runtime has its own configuration; align them to the target environment before connecting.
4. Grant and verify the intended operators. Coordinate API and portal rollout; do not leave old API instances serving traffic alongside token-version enforcement. Require fresh sign-in.
5. Verify login, password reset/change, permissions, asset save/edit, inventory rollback, monitor conflicts, and other shared table screens against the staging database.
6. Verify browser-driver printing on the actual GK420t using 50.8 by 25.4 mm media, actual-size scaling, no headers/footers, and correct media calibration. Measure labels, scan their URLs, and check consecutive labels for drift before a batch.
7. Record printer connection (USB/network), driver/media settings, operator mappings, migration output, and the production smoke-test result.

Direct ZPL transport depends on the still-unconfirmed printer connection and a selected print bridge/server service. Browser printing is implemented without requiring that decision. No silent-print or physical-delivery guarantee is made.

## Recovery

Keep additive columns/tables if code must be rolled back; do not discard assignment data or restore obsolete password hashes. Migration down intentionally refuses automatic destructive rollback. Use a reviewed recovery build retaining token-version and password-change enforcement, or block account operations and invalidate sessions during recovery. An older API without these checks must not be reintroduced while revoked tokens remain valid by signature alone.

Remaining release gates: migration rehearsal on a real restored database, verified operator grants and deployed category mapping, multi-process concurrency checks, physical GK420t calibration/scanning, and final staging acceptance. None has been performed against production in this development run.
