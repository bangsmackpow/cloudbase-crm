# CloudBase CRM Consistency Audit
$ErrorActionPreference = "Continue"

$requiredFiles = @(
    "wrangler.toml",
    "package.json",
    ".gitignore",
    "README.md",
    "migrations/0001_core.sql",
    "migrations/0002_audits.sql",
    "migrations/0003_billing_setup.sql",
    "src/index.ts",
    "src/auth/middleware.ts",
    "src/api/technical/audits.ts",
    "src/api/exec/reports.ts",
    "src/workers/hunter.ts",
    "flavors/msp.json",
    "flavors/trades.json",
    "templates/msp_audit.md",
    "dashboard/src/pages/Dashboard.tsx"
)

Write-Host "--- CloudBase CRM: GitHub Readiness Audit ---" -ForegroundColor Cyan
$missingCount = 0

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        if ($size -gt 0) {
            Write-Host "  [OK] Found: $file ($size bytes)" -ForegroundColor Green
        }
        else {
            Write-Host "  [!] Empty: $file (Needs Content)" -ForegroundColor Yellow
            $missingCount++
        }
    }
    else {
        Write-Host "  [X] MISSING: $file" -ForegroundColor Red
        $missingCount++
    }
}

Write-Host "`n--- Audit Summary ---" -ForegroundColor Cyan
if ($missingCount -eq 0) {
    Write-Host "✅ All core files present. You are ready to push to GitHub!" -ForegroundColor Green
}
else {
    Write-Host "❌ $missingCount items need attention before your first commit." -ForegroundColor Red
}