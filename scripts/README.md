# Supabase Backup & Restore Pipeline

This directory contains scripts to manage database state between environments or as a safety net during testing.

## Prerequisites
- **Docker**: Must be running.
- **Database Password**: You will need your Supabase Postgres password.

## How to Backup
Run the backup script. It will create a timestamped folder in the `backups/` directory containing a full SQL dump (Schema + Data + RLS + Triggers).

```powershell
./scripts/backup-db.ps1 -Password "your-password"
```

## How to Restore
Run the restore script pointing to a specific SQL dump. **CAUTION**: This will overwrite existing data.

```powershell
./scripts/restore-db.ps1 -Password "your-password" -BackupFile "backups/20260422_123456/full_dump.sql"
```

## Features
- **Docker-based**: No need to install `postgresql` client tools locally.
- **Full State**: Captures everything including RLS policies, triggers, and sequences.
- **Safe Dumps**: Uses `--clean --if-exists` to ensure a smooth overwrite during restore.
