# trigger-ios-build.ps1
param(
    [string]$Branch = "main",
    [string]$BuildType = "development"
)

Write-Host "🚀 Triggering iOS build..." -ForegroundColor Green
Write-Host "Branch: $Branch" -ForegroundColor Cyan
Write-Host "Build Type: $BuildType" -ForegroundColor Cyan

# Check if GitHub CLI is installed
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found. Installing..." -ForegroundColor Yellow
    winget install GitHub.cli
    Write-Host "✅ GitHub CLI installed. Please restart your terminal and run this script again." -ForegroundColor Green
    exit
}

# Trigger workflow
try {
    gh workflow run ios-build.yml --ref $Branch --field build_type=$BuildType
    
    Write-Host "✅ iOS build triggered successfully!" -ForegroundColor Green
    Write-Host "📱 View progress at: https://github.com/RyanNovinc/DevBuild/actions" -ForegroundColor Cyan
    
    # Open browser to actions page
    Start-Process "https://github.com/RyanNovinc/DevBuild/actions"
}
catch {
    Write-Host "❌ Failed to trigger build: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure you're authenticated with GitHub CLI: gh auth login" -ForegroundColor Yellow
}