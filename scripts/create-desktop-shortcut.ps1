$ErrorActionPreference = 'Stop'

function Write-Info([string]$msg) { Write-Host "[shortcut] $msg" -ForegroundColor Cyan }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop 'Flash Cards - Start Server.lnk'
$targetBat = Join-Path $projectRoot 'scripts\start-dev.bat'

if (-not (Test-Path $targetBat)) { throw "Start script not found: $targetBat" }

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($lnkPath)
$Shortcut.TargetPath = $targetBat
$Shortcut.WorkingDirectory = $projectRoot
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = (Join-Path $env:SystemRoot 'System32\SHELL32.dll,220')
$Shortcut.Description = 'Start Flash Cards dev server'
$Shortcut.Save()

Write-Info "Desktop shortcut created: $lnkPath"


