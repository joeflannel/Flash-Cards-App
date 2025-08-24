$ErrorActionPreference = 'SilentlyContinue'

function Write-Info([string]$msg) { Write-Host "[autostart] $msg" -ForegroundColor Cyan }

$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$lnkPath = Join-Path $startupDir 'Flash Cards - Start Server.lnk'

if (Test-Path $lnkPath) { Remove-Item $lnkPath -Force }

Write-Info "Autostart disabled."


