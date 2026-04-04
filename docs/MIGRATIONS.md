# Database Migration Guide

How to manage InsForge PostgreSQL schema changes for DanClaw.

## Overview

DanClaw uses InsForge.dev for backend infrastructure. InsForge provides a managed PostgreSQL database with CLI tools for schema management.

## Apply Initial Schema

```bash
cd danclaw

# Login to InsForge
npx @insforge/cli login

# Link to project (optional - can use --project-id flag directly)
npx @insforge/cli link --project-id <YOUR_PROJECT_ID>

# Apply schema
npx @insforge/cli db push --project-id <YOUR_PROJECT_ID> --schema-path docs/SCHEMA.sql
```

## Add New Tables or Columns

### Option 1: Direct SQL (Development)

```bash
npx @insforge/cli db query "CREATE TABLE IF NOT EXISTS public.my_table (id UUID PRIMARY KEY);" --project-id <ID>
```

### Option 2: Migration Files (Recommended for Production)

1. Create migration file:
```bash
# Structure: apps/web/src/sql/migrations/YYYYMMDDHHMMSS_description.sql
```

2. Edit migration file with only the new changes:
```sql
-- Migration: 002_add_feature_table.sql
-- Add new table
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_features_name ON public.features(name);
```

3. Apply migration:
```bash
npx @insforge/cli db push --project-id <ID> --schema-path apps/web/src/sql/migrations/002_add_feature_table.sql
```

## Version Control Strategy

### Schema Files Location

```
danclaw/
├── docs/
│   └── SCHEMA.sql           # Master schema (source of truth)
├── apps/
│   └── web/
│       └── src/
│           └── sql/
│               └── migrations/
│                   ├── 001_initial_schema.sql
│                   └── 002_add_feature_table.sql
```

### Workflow

1. **Always update `docs/SCHEMA.sql`** with the complete current schema
2. **Create incremental migrations** in `apps/web/src/sql/migrations/`
3. **Migration files must be idempotent** - use `IF NOT EXISTS`
4. **Never modify applied migrations** - create new ones instead

### Example: Adding a Column

**docs/SCHEMA.sql** (master schema):
```sql
-- Existing table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  -- Add new column here
  max_deployments INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Migration file** `apps/web/src/sql/migrations/003_add_max_deployments.sql`:
```sql
-- Migration: 003_add_max_deployments.sql
-- Add max_deployments column to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS max_deployments INTEGER DEFAULT 3;

COMMENT ON COLUMN public.users.max_deployments IS 'Maximum number of deployments allowed for this tier';
```

## Seed Data

Development seed data is in `docs/SCHEMA.sql` (bottom section).

**Important**: Seed data only runs in development. Production uses empty tables.

To clear seed data:
```sql
DELETE FROM public.messages WHERE deployment_id IN (SELECT id FROM public.deployments WHERE service_name LIKE 'dev-%');
DELETE FROM public.deployments WHERE service_name LIKE 'dev-%';
DELETE FROM public.users WHERE email LIKE 'dev-%@danclaw.dev';
```

## Rollback Strategy

InsForge managed PostgreSQL doesn't support automatic rollbacks. Strategy:

1. **Backup before migration**:
```bash
npx @insforge/cli db dump --project-id <ID> > backup_$(date +%Y%m%d).sql
```

2. **If migration fails**: Restore from backup
3. **Fix and re-run** migration file

## InsForge CLI Commands

| Command | Description |
|---------|-------------|
| `npx @insforge/cli login` | Authenticate |
| `npx @insforge/cli link --project-id <ID>` | Link to project |
| `npx @insforge/cli db push --project-id <ID> --schema-path <file>` | Apply SQL file |
| `npx @insforge/cli db query <sql> --project-id <ID>` | Run SQL query |
| `npx @insforge/cli db dump --project-id <ID>` | Export database |
| `npx @insforge/cli db restore <file> --project-id <ID>` | Restore from backup |

## Row Level Security

The schema includes RLS policies. Key points:

- **Users** can only access their own data
- **Deployments** check `user_id = auth.uid()`
- **Messages** access through parent deployment ownership

If you add new tables, include RLS:
```sql
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "new_table_select_own" ON public.new_table
  FOR SELECT USING (user_id = auth.uid());
```

## Troubleshooting

### "relation does not exist"
→ Schema not applied. Run: `npx @insforge/cli db push --project-id <ID> --schema-path docs/SCHEMA.sql`

### "permission denied for table"
→ RLS policy issue. Verify you're authenticated: `npx @insforge/cli login`

### "duplicate key value violates unique constraint"
→ Data already exists. Migration is not idempotent - check your SQL.
