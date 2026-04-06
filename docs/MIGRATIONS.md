# Database Migration Guide

How to manage InsForge PostgreSQL schema changes for DanClaw.

## Overview

DanClaw uses InsForge.dev for backend infrastructure. InsForge provides a managed PostgreSQL database with CLI tools for schema management.

The schema source of truth is `docs/SCHEMA.sql` — always keep it updated.

## Apply Initial Schema

```bash
cd danclaw

# Login to InsForge
npx @insforge/cli login

# Link to project (optional - can use --project-id flag directly)
npx @insforge/cli link --project-id <YOUR_PROJECT_ID>

# Apply schema
npx @insforge/cli db push \
  --project-id YOUR_PROJECT_ID \
  --schema-path docs/SCHEMA.sql
```

## Schema Version Control Strategy

### File Structure

```
danclaw/
├── docs/
│   └── SCHEMA.sql              # Master schema (source of truth)
├── apps/
│   └── web/
│       └── src/
│           └── sql/
│               └── migrations/
│                   ├── 001_initial_schema.sql
│                   ├── 002_add_agents_table.sql
│                   └── 003_add_feature_column.sql
```

### Workflow

1. **Always update `docs/SCHEMA.sql`** with the complete current schema
2. **Create incremental migrations** in `apps/web/src/sql/migrations/`
3. **Migration files must be idempotent** — use `IF NOT EXISTS`
4. **Never modify applied migrations** — create new ones instead

## Add New Tables or Columns

### Option 1: Direct SQL (Development Only)

```bash
npx @insforge/cli db query "CREATE TABLE IF NOT EXISTS public.my_table (id UUID PRIMARY KEY);" --project-id <ID>
```

### Option 2: Migration Files (Recommended)

1. Create migration file:
```bash
# Naming convention: YYYYMMDDHHMMSS_description.sql
# Example: apps/web/src/sql/migrations/002_add_agents_table.sql
```

2. Edit migration file with only the new changes:
```sql
-- Migration: 002_add_agents_table.sql
-- Description: Add agents table for OpenClaw configurations

-- Add new table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model TEXT NOT NULL DEFAULT 'anthropic/claude-3.5-sonnet',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  tools JSONB DEFAULT '[]',
  memory_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "agents_insert_own" ON public.agents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "agents_delete_own" ON public.agents
  FOR DELETE USING (user_id = auth.uid());
```

3. Apply migration:
```bash
npx @insforge/cli db push \
  --project-id <ID> \
  --schema-path apps/web/src/sql/migrations/002_add_agents_table.sql
```

## Example: Adding a Column

### Step 1: Update Migration File

**Migration file** `apps/web/src/sql/migrations/003_add_max_deployments.sql`:
```sql
-- Migration: 003_add_max_deployments.sql
-- Description: Add max_deployments column to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS max_deployments INTEGER DEFAULT 3;

COMMENT ON COLUMN public.users.max_deployments IS 'Maximum number of deployments allowed for this tier';
```

### Step 2: Apply Migration

```bash
npx @insforge/cli db push \
  --project-id <ID> \
  --schema-path apps/web/src/sql/migrations/003_add_max_deployments.sql
```

### Step 3: Update Master Schema

Add the column to `docs/SCHEMA.sql` in the users table:
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  max_deployments INTEGER DEFAULT 3,  -- ← new column
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Seed Data

Development seed data is in `docs/SCHEMA.sql` (bottom section under `-- 5. SEED DATA`).

**Important**: Seed data only runs in development. Production uses empty tables.

To clear seed data:
```sql
DELETE FROM public.messages WHERE deployment_id IN (SELECT id FROM public.deployments WHERE service_name LIKE 'dev-%');
DELETE FROM public.deployments WHERE service_name LIKE 'dev-%';
DELETE FROM public.users WHERE email LIKE 'dev-%@danclaw.dev';
```

To reseed (drop and recreate):
```bash
# Clear existing data
npx @insforge/cli db query "
  DELETE FROM public.messages;
  DELETE FROM public.deployments;
  DELETE FROM public.activity;
  DELETE FROM public.users WHERE email LIKE 'dev-%@danclaw.dev';
" --project-id <ID>

# Re-apply schema (includes seed data at bottom)
npx @insforge/cli db push --project-id <ID> --schema-path docs/SCHEMA.sql
```

## Rollback Strategy

InsForge managed PostgreSQL doesn't support automatic rollbacks. Strategy:

### Before Migration: Backup

```bash
# Export current schema
npx @insforge/cli db dump --project-id <ID> > backup_$(date +%Y%m%d_%H%M%S).sql
```

### If Migration Fails

1. **Check error message** — usually syntax or constraint violation
2. **Fix migration file** — make it idempotent
3. **Re-apply**:
```bash
# Option A: Re-apply full schema
npx @insforge/cli db push --project-id <ID> --schema-path docs/SCHEMA.sql

# Option B: Restore from backup
npx @insforge/cli db restore backup_YYYYMMDD_HHMMSS.sql --project-id <ID>
```

## InsForge CLI Commands

| Command | Description |
|---------|-------------|
| `npx @insforge/cli login` | Authenticate with InsForge |
| `npx @insforge/cli link --project-id <ID>` | Link to project |
| `npx @insforge/cli db push --project-id <ID> --schema-path <file>` | Apply SQL file |
| `npx @insforge/cli db query <sql> --project-id <ID>` | Run SQL query |
| `npx @insforge/cli db dump --project-id <ID>` | Export database |
| `npx @insforge/cli db restore <file> --project-id <ID>` | Restore from backup |
| `npx @insforge/cli db status --project-id <ID>` | Check migration status |

## Row Level Security (RLS)

The schema includes RLS policies for data isolation. Key points:

- **Users** can only access their own data
- **Deployments** check `user_id = auth.uid()`
- **Messages** access through parent deployment ownership
- **Agents** check through user ownership

### Adding RLS to New Tables

```sql
-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Select policy (user owns the row)
CREATE POLICY "new_table_select_own" ON public.new_table
  FOR SELECT USING (user_id = auth.uid());

-- Insert policy
CREATE POLICY "new_table_insert_own" ON public.new_table
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update policy
CREATE POLICY "new_table_update_own" ON public.new_table
  FOR UPDATE USING (user_id = auth.uid());

-- Delete policy
CREATE POLICY "new_table_delete_own" ON public.new_table
  FOR DELETE USING (user_id = auth.uid());
```

## Troubleshooting

### "relation does not exist"

→ Schema not applied. Run:
```bash
npx @insforge/cli db push --project-id <ID> --schema-path docs/SCHEMA.sql
```

### "permission denied for table"

→ RLS policy issue. Verify you're authenticated:
```bash
npx @insforge/cli login
```

### "duplicate key value violates unique constraint"

→ Data already exists. Migration is not idempotent — check your SQL uses `IF NOT EXISTS`.

### "column X of relation X already exists"

→ Column already added. Migration should use `ADD COLUMN IF NOT EXISTS`.

### "cannot drop column X because other objects depend on it"

→ Foreign key or index depends on column. Drop dependent objects first:
```sql
-- Find dependent objects
SELECT
    dep.objid::regclass AS dependent_object,
    dep.deptype
FROM pg_depend dep
JOIN pg_attribute att ON att.attrelid = dep.refobjid AND att.attnum = dep.refobjsubid
WHERE att.attname = 'column_name';
```
