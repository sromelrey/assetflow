-- Read-only checks. Run against a restored/staging database before the release migration.
-- Matching is by trimmed, case-insensitive email, only for non-deleted records.
SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS accounts
FROM users WHERE deleted_at IS NULL GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;

SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS employees
FROM employee WHERE deleted_at IS NULL AND NULLIF(TRIM(email),'') IS NOT NULL
GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;

SELECT id, name FROM category ORDER BY id;
SELECT status, COUNT(*) FROM employee WHERE deleted_at IS NULL GROUP BY status ORDER BY status;

-- Show only IDs and email for operator verification; do not select credential fields.
SELECT id, name, email, is_active FROM users WHERE deleted_at IS NULL ORDER BY id;
