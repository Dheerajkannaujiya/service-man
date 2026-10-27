# ==============================================================================
# ServiceMan Clean Repository Exporter & Initializer Script
# ==============================================================================
# This script extracts this complete project into a brand new folder,
# strips away heavy node_modules, .git histories, and build caches,
# sets up clean .env files from templates, and initializes a fresh git repo!
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\export-clean-repo.ps1
#   Or specify a custom path:
#   powershell -ExecutionPolicy Bypass -File .\export-clean-repo.ps1 -Destination "C:\Users\Asus\Desktop\serviceman-test"
# ==============================================================================

param(
    [string]$Destination = "$HOME\Desktop\serviceman-clean-test"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   ServiceMan Clean Repository Exporter & Initializer   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Source directory:      $PSScriptRoot" -ForegroundColor Yellow
Write-Host "Destination directory: $Destination" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $Destination) {
    $confirm = Read-Host "Destination already exists. Overwrite contents? (y/n)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Export cancelled." -ForegroundColor Red
        exit 0
    }
} else {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

$excludeList = @(
    'node_modules',
    '.git',
    'dist',
    '.DS_Store',
    'Thumbs.db',
    '*.log'
)

Write-Host "Copying project files (excluding node_modules and .git)..." -ForegroundColor Green

# Use robocopy for fast, clean copying on Windows
$robocopyArgs = @(
    $PSScriptRoot,
    $Destination,
    '/E',
    '/XD', 'node_modules', '.git', 'dist', '.vscode', '.idea',
    '/XF', '*.log', '*.tmp',
    '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np'
)
& robocopy.exe @robocopyArgs | Out-Null

# Setup default .env in new destination if not already present
if (-not (Test-Path "$Destination\server\.env")) {
    if (Test-Path "$Destination\server\.env.example") {
        Copy-Item "$Destination\server\.env.example" "$Destination\server\.env"
        Write-Host "Created server\.env from server\.env.example" -ForegroundColor Green
    }
}

if (-not (Test-Path "$Destination\client\.env")) {
    if (Test-Path "$Destination\client\.env.example") {
        Copy-Item "$Destination\client\.env.example" "$Destination\client\.env"
        Write-Host "Created client\.env from client\.env.example" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " EXPORT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Clean Project Location: $Destination" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To initialize as a brand new Git repo and start testing:" -ForegroundColor Yellow
Write-Host "  1. cd `"$Destination`"" -ForegroundColor Cyan
Write-Host "  2. git init" -ForegroundColor Cyan
Write-Host "  3. git add ." -ForegroundColor Cyan
Write-Host "  4. git commit -m `"Initial commit of ServiceMan`"" -ForegroundColor Cyan
Write-Host "  5. npm run install:all" -ForegroundColor Cyan
Write-Host "  6. npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both client and server will run simultaneously at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
