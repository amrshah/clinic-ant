# scripts/backup-db.ps1
# Usage: ./scripts/backup-db.ps1 -Password "YourDbPassword"

param (
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$HostName = "db.gvepbmkqsufvmoybarus.supabase.co"
$User = "postgres"
$DbName = "postgres"
$Port = "5432"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "backups/$Timestamp"

New-Item -ItemType Directory -Force -Path $BackupDir

Write-Host "Starting backup to $BackupDir..." -ForegroundColor Cyan

# Use Docker to run pg_dump (this avoids needing psql installed locally)
# --clean: Include commands to DROP database objects before creating them
# --if-exists: Use IF EXISTS when dropping objects
# --no-owner: Skip commands to set ownership of objects
# --no-privileges: Skip restoration of access privileges (grant/revoke)
docker run --rm -e PGPASSWORD=$Password postgres:15 pg_dump -h $HostName -p $Port -U $User -d $DbName --clean --if-exists --no-owner --no-privileges > "$BackupDir/full_dump.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup successful: $BackupDir/full_dump.sql" -ForegroundColor Green
} else {
    Write-Host "❌ Backup failed!" -ForegroundColor Red
}
