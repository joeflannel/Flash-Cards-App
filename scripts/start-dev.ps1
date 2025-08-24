param(
    [int]$Port = 5173,
    [string]$HostAddress = "127.0.0.1"
)

$ErrorActionPreference = 'Stop'

function Write-Info([string]$msg) { Write-Host "[start-dev] $msg" -ForegroundColor Cyan }
function Write-Warn([string]$msg) { Write-Host "[start-dev] $msg" -ForegroundColor Yellow }
function Write-Err([string]$msg)  { Write-Host "[start-dev] $msg" -ForegroundColor Red }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $projectRoot
Write-Info "Project root: $projectRoot"

# Ensure Node is available (prefer PATH; fallback to WinGet install path)
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    $nodeExe = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter node.exe -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
    if ($nodeExe) {
        $nodeDir = Split-Path $nodeExe -Parent
        $env:PATH = "$nodeDir;$env:PATH"
        Write-Info "Using Node from: $nodeExe"
    } else {
        Write-Err "Node.js not found. Please install Node LTS with: winget install --id OpenJS.NodeJS.LTS -e"
        exit 1
    }
}

# npm CLI path (works even when npm isn't on PATH via shim)
$npmCli = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter npm-cli.js -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

# Ensure dependencies are installed (if vite binary missing)
$viteJs = Join-Path $projectRoot 'node_modules/vite/bin/vite.js'
if (-not (Test-Path $viteJs)) {
    if (-not $npmCli) {
        Write-Err "npm-cli.js not found. Cannot install dependencies."
        exit 1
    }
    Write-Info "Installing dependencies (first run)..."
    try {
        & node $npmCli install --no-fund --no-audit
    } catch {
        Write-Warn "Install failed once, retrying esbuild rebuild and install..."
        & node $npmCli rebuild esbuild
        & node $npmCli install --no-fund --no-audit
    }
}

if (-not (Test-Path $viteJs)) {
    Write-Err "Vite not found at $viteJs. Try running 'npm install' manually."
    exit 1
}

# Default values for host and port
$HostAddress = "localhost"
$Port = 3000

Write-Info "Starting dev server on http://${HostAddress}:${Port} (strict port)..."
Write-Host ""

# Run in the current console so you see logs and can Ctrl+C to stop
& node $viteJs --host $HostAddress --port $Port --strictPort --clearScreen false


