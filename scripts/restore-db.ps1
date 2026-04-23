# scripts/restore-db.ps1
# Usage: ./scripts/restore-db.ps1 -Password "YourDbPassword" -BackupFile "backups/20260422_123456/full_dump.sql"

param (
    [Parameter(Mandatory=$true)]
    [string]$Password,
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$HostName = "db.gvepbmkqsufvmoybarus.supabase.co"
$User = "postgres"
$DbName = "postgres"
$Port = "5432"

if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️ WARNING: This will overwrite the current database state!" -ForegroundColor Yellow
Write-Host "Starting restore from $BackupFile..." -ForegroundColor Cyan

# Use Docker to run psql
Get-Content $BackupFile | docker run --rm -i -e PGPASSWORD=$Password postgres:15 psql -h $HostName -p $Port -U $User -d $DbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Restore successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Restore failed!" -ForegroundColor Red
}
