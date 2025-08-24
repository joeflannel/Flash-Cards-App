$ErrorActionPreference = 'Stop'

function Write-Info([string]$msg) { Write-Host "[autostart] $msg" -ForegroundColor Cyan }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$lnkPath = Join-Path $startupDir 'Flash Cards - Start Server.lnk'
$targetBat = Join-Path $projectRoot 'scripts\start-dev.bat'

if (-not (Test-Path $startupDir)) { New-Item -ItemType Directory -Path $startupDir | Out-Null }

if (-not (Test-Path $targetBat)) {
	throw "Start script not found: $targetBat"
}

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($lnkPath)
$Shortcut.TargetPath = $targetBat
$Shortcut.WorkingDirectory = $projectRoot
$Shortcut.WindowStyle = 7 # Minimized
$Shortcut.IconLocation = (Join-Path $env:SystemRoot 'System32\SHELL32.dll,220')
$Shortcut.Description = 'Start Flash Cards dev server at login'
$Shortcut.Save()

Write-Info "Autostart enabled: $lnkPath"


