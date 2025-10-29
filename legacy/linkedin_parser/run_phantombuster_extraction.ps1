# PhantomBuster to CSV Workflow Runner
param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    
    [Parameter(Mandatory=$false)]
    [string]$Output = "linkedin_posts_phantombuster.csv"
)

Write-Host "Starting PhantomBuster to CSV Workflow" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Change to script directory
Set-Location $PSScriptRoot

# Validate URL
if (-not $Url.StartsWith("https://phantombuster.com/")) {
    Write-Host "❌ Error: URL must be a valid PhantomBuster console URL" -ForegroundColor Red
    Write-Host "   Example: https://phantombuster.com/123/phantoms/456/console" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not $Url.Contains("/console")) {
    Write-Host "❌ Error: URL must be a PhantomBuster console URL (must contain '/console')" -ForegroundColor Red
    Write-Host "   Example: https://phantombuster.com/123/phantoms/456/console" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
pip install -r requirements_phantombuster.txt

Write-Host "`nRunning complete workflow..." -ForegroundColor Yellow
Write-Host "Console URL: $Url" -ForegroundColor Cyan
Write-Host "Output CSV: $Output" -ForegroundColor Cyan

python complete_phantombuster_workflow.py --url "$Url" --output "$Output"

Write-Host "`nWorkflow completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
