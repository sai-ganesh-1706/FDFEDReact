# PowerShell script to verify all FDFED evaluation middlewares in CareerNest backend

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CareerNest Middleware Verification & Test Runner       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start NestJS Backend Server
Write-Host "[1/7] Launching backend server on port 3000..." -ForegroundColor Yellow
$ServerProcess = Start-Process node -ArgumentList "dist/main.js" -PassThru -NoNewWindow -WorkingDirectory $PSScriptRoot

# Wait for server to start up
$MaxWait = 10
$Started = $false
for ($i = 1; $i -le $MaxWait; $i++) {
    Start-Sleep -Seconds 1
    try {
        # Check using curl.exe
        $check = curl.exe -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api"
        if ($check -eq "200") {
            $Started = $true
            break
        }
    } catch {}
}

if (-not $Started) {
    Write-Host "ERROR: Backend server failed to start within $MaxWait seconds." -ForegroundColor Red
    if ($ServerProcess) { Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}
Write-Host "Backend server is running!" -ForegroundColor Green

# Define test results storage
$TestsPassed = 0
$TestsFailed = 0

function Assert-Condition ($Condition, $Message) {
    if ($Condition) {
        Write-Host "  [PASS] $Message" -ForegroundColor Green
        $global:TestsPassed++
    } else {
        Write-Host "  [FAIL] $Message" -ForegroundColor Red
        $global:TestsFailed++
    }
}

try {
    # ── Test 1: Security Middleware Headers ──
    Write-Host "`n[2/7] Testing Security Headers Middleware..." -ForegroundColor Yellow
    
    # We fetch the headers using curl.exe
    $HeaderFile = Join-Path $PSScriptRoot "headers.tmp"
    curl.exe -s -D $HeaderFile -o /dev/null "http://localhost:3000/opportunities" -H "x-role: super_admin"
    
    $HeadersText = Get-Content $HeaderFile
    if (Test-Path $HeaderFile) { Remove-Item $HeaderFile -Force }

    $XFrame = ($HeadersText | Where-Object { $_ -match "X-Frame-Options:" })
    $XContentType = ($HeadersText | Where-Object { $_ -match "X-Content-Type-Options:" })
    $XXSS = ($HeadersText | Where-Object { $_ -match "X-XSS-Protection:" })
    $CSP = ($HeadersText | Where-Object { $_ -match "Content-Security-Policy:" })
    $HSTS = ($HeadersText | Where-Object { $_ -match "Strict-Transport-Security:" })

    Assert-Condition ($XFrame -match "DENY") "X-Frame-Options: DENY is set"
    Assert-Condition ($XContentType -match "nosniff") "X-Content-Type-Options: nosniff is set"
    Assert-Condition ($XXSS -match "1; mode=block") "X-XSS-Protection: 1; mode=block is set"
    Assert-Condition ($CSP -match "default-src 'self'") "Content-Security-Policy is set"
    Assert-Condition ($HSTS -match "max-age") "Strict-Transport-Security is set"


    # ── Test 2: Error Handling Middleware (Different Case 1: NOT FOUND) ──
    Write-Host "`n[3/7] Testing Error Handling: Case 1 - Missing Route (NOT_FOUND_ERROR)..." -ForegroundColor Yellow
    
    $ErrorJsonText = curl.exe -s "http://localhost:3000/non-existent-route-for-test" -H "x-role: super_admin"
    $JSON = $ErrorJsonText | ConvertFrom-Json

    Assert-Condition ($JSON -ne $null) "Response is valid JSON"
    if ($JSON) {
        Assert-Condition ($JSON.statusCode -eq 404) "Response JSON contains statusCode: 404"
        Assert-Condition ($JSON.category -eq "NOT_FOUND_ERROR") "Categorized error as NOT_FOUND_ERROR"
        Assert-Condition ($JSON.path -eq "/non-existent-route-for-test") "Contains request path"
        Assert-Condition ($JSON.error -eq "Not Found") "Contains error type"
    }

    # Verify Error Log File
    $Today = Get-Date -Format "yyyy-MM-dd"
    $ErrorLogFile = Join-Path $PSScriptRoot "logs/error-$Today.log"
    Assert-Condition (Test-Path $ErrorLogFile) "Error log file exists: logs/error-$Today.log"
    if (Test-Path $ErrorLogFile) {
        $LogContent = Get-Content $ErrorLogFile -Tail 10
        $LoggedMatch = $LogContent | Where-Object { $_ -match "NOT_FOUND_ERROR" }
        Assert-Condition ($LoggedMatch -ne $null) "Error logged to file with category [NOT_FOUND_ERROR]"
    }


    # ── Test 3: Error Handling Middleware (Different Case 2: VALIDATION PIPES) ──
    Write-Host "`n[4/7] Testing Error Handling: Case 2 - DTO Validation (VALIDATION_ERROR)..." -ForegroundColor Yellow
    
    # Save body to a temp file to avoid quotation escaping bugs in PowerShell
    $TempJsonFile = Join-Path $PSScriptRoot "temp_body.json"
    $InvalidBody = '{"name": "Test User", "email": "not-an-email", "password": "123", "role": "candidate"}'
    [System.IO.File]::WriteAllText($TempJsonFile, $InvalidBody)
    
    $ValJsonText = curl.exe -s -X POST "http://localhost:3000/users" -H "x-role: super_admin" -H "Content-Type: application/json" -d "@$TempJsonFile"
    $ValJSON = $ValJsonText | ConvertFrom-Json

    if (Test-Path $TempJsonFile) { Remove-Item $TempJsonFile -Force }

    Assert-Condition ($ValJSON -ne $null) "Response is valid JSON"
    if ($ValJSON) {
        Assert-Condition ($ValJSON.statusCode -eq 400) "Response JSON contains statusCode: 400"
        Assert-Condition ($ValJSON.category -eq "VALIDATION_ERROR") "Categorized error as VALIDATION_ERROR"
        Assert-Condition ($ValJSON.message.Count -ge 1) "Returns structured validation failure details: $($ValJSON.message -join '; ')"
    }


    # ── Test 4: Error Handling Middleware (Different Case 3: ROLE FORBIDDEN) ──
    Write-Host "`n[5/7] Testing Error Handling: Case 3 - Unauthorized / Guard Check (SECURITY_AUDIT)..." -ForegroundColor Yellow
    
    # Save opportunity body to temp file
    $TempOppFile = Join-Path $PSScriptRoot "temp_opp.json"
    $OpportunityBody = '{"title": "Software Intern", "type": "internship", "company": "Acme", "description": "Intern role", "location": "Remote", "requirements": ["Coding"]}'
    [System.IO.File]::WriteAllText($TempOppFile, $OpportunityBody)
    
    # Post opportunities is restricted (candidates not allowed, throws Forbidden 403)
    $AuthJsonText = curl.exe -s -X POST "http://localhost:3000/opportunities" -H "x-role: candidate" -H "Content-Type: application/json" -d "@$TempOppFile"
    $AuthJSON = $AuthJsonText | ConvertFrom-Json

    if (Test-Path $TempOppFile) { Remove-Item $TempOppFile -Force }

    Assert-Condition ($AuthJSON -ne $null) "Response is valid JSON"
    if ($AuthJSON) {
        Assert-Condition ($AuthJSON.statusCode -eq 403) "Response JSON contains statusCode: 403 Forbidden"
        Assert-Condition ($AuthJSON.category -eq "SECURITY_AUDIT") "Categorized guard exception as SECURITY_AUDIT"
    }


    # ── Test 5: File Upload Middleware ──
    Write-Host "`n[6/7] Testing File Upload Middleware (Valid Upload)..." -ForegroundColor Yellow
    
    # Create a dummy PNG file
    $TempPng = Join-Path $PSScriptRoot "temp_test_image.png"
    [System.IO.File]::WriteAllBytes($TempPng, @(137, 80, 78, 71, 13, 10, 26, 10)) # Minimal PNG header bytes
    
    $UploadUrl = "http://localhost:3000/users/1/profile-picture"
    
    # Perform upload with curl.exe
    $UploadJsonText = curl.exe -s -X POST $UploadUrl -H "x-role: candidate" -F "file=@$TempPng"
    $UploadJSON = $UploadJsonText | ConvertFrom-Json

    Assert-Condition ($UploadJSON -ne $null) "Upload response is valid JSON"
    if ($UploadJSON) {
        Assert-Condition ($UploadJSON.statusCode -eq 201) "Returns HTTP 201 Created for file upload"
        Assert-Condition ($UploadJSON.message -eq "Profile picture uploaded successfully") "Response JSON confirms success"
        Assert-Condition ($UploadJSON.filename -ne $null) "Response JSON returns saved filename"
        
        $SavedFile = Join-Path $PSScriptRoot "uploads/$($UploadJSON.filename)"
        Assert-Condition (Test-Path $SavedFile) "Uploaded file exists in uploads/ directory"
        
        if (Test-Path $SavedFile) { Remove-Item $SavedFile -Force }
    }
    
    if (Test-Path $TempPng) { Remove-Item $TempPng -Force }


    # ── Test 6: Security Middleware Rate Limiting ──
    Write-Host "`n[7/7] Testing Security Rate Limiting (Sending 105 rapid requests)..." -ForegroundColor Yellow
    $RateLimited = $false
    for ($r = 1; $r -le 105; $r++) {
        $HttpCode = curl.exe -s -o /dev/null -w "%{http_code}" "http://localhost:3000/opportunities" -H "x-role: super_admin"
        if ($HttpCode -eq "429") {
            $RateLimited = $true
            break
        }
    }
    Assert-Condition ($RateLimited) "Rate limiter blocked request after 100 limit, returning HTTP 429"

} finally {
    # ── Shutdown Server ──
    Write-Host "`nShutting down backend server process..." -ForegroundColor Yellow
    if ($ServerProcess) {
        Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "Backend server stopped." -ForegroundColor Green
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
$SummaryColor = "Green"
if ($TestsFailed -gt 0) { $SummaryColor = "Red" }
Write-Host "   Verification Summary: $TestsPassed Passed, $TestsFailed Failed" -ForegroundColor $SummaryColor
Write-Host "==========================================================" -ForegroundColor Cyan
