$exts = @('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.yml', '.yaml', '.mjs', '.sql')
Get-ChildItem -Path . -Recurse -File | Where-Object { 
    ($_.Extension -in $exts -or $_.Name -eq 'Dockerfile') -and 
    ($_.FullName -notmatch '\\(node_modules|\.next|\.git)\\') 
} | ForEach-Object { 
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'ClinicAnt', 'ClinicFlow' `
                           -replace 'clinicant.demo', 'clinicflow.demo' `
                           -replace 'clinic-ant', 'clinic-flow' `
                           -replace 'Clinic Ant', 'Clinic Flow'
    if ($content -ne $newContent) { 
        Set-Content $_.FullName $newContent
        Write-Host "Updated $($_.FullName)"
    } 
}
