$ErrorActionPreference = 'Continue'

function Write-Info([string]$msg) { Write-Host "[stop-dev] $msg" -ForegroundColor Cyan }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pwdEsc = [regex]::Escape($projectRoot)

Write-Info "Stopping Vite/Node processes for project: $projectRoot"

$nodeProcs = @(Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'node.exe' -and (($_.CommandLine -match 'vite') -or ($_.CommandLine -match $pwdEsc))
})

foreach ($p in $nodeProcs) {
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
}

Write-Info "Done."


