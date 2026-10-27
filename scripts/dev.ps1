<#
.SYNOPSIS
    Phantom Dependency Developer Startup Script for Windows 11 PowerShell
.DESCRIPTION
    Launches the Phantom Dependency local AI backend (FastAPI) and frontend (Next.js)
    with environment verification, Ollama checks, and graceful startup.
.PARAMETER ApiOnly
    Starts only the FastAPI backend server.
.PARAMETER WebOnly
    Starts only the Next.js frontend dev server.
#>

param(
    [switch]$ApiOnly,
    [switch]$WebOnly
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "     * * * Phantom Dependency - Ghost in the Machine * * *     " -ForegroundColor DarkMagenta
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "Every project has a past. Discover the dependencies haunting yours." -ForegroundColor DarkGray
Write-Host ""

$RootDir = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $RootDir "apps\api"
$WebDir = Join-Path $RootDir "apps\web"
$PythonExe = Join-Path $ApiDir ".venv\Scripts\python.exe"

# 0. Clean up any stale processes on port 8000 or 3000
$staleConnections = Get-NetTCPConnection -LocalPort 8000, 3000 -ErrorAction SilentlyContinue
if ($staleConnections) {
    Write-Host "Releasing previously bound ports..." -ForegroundColor DarkGray
    foreach ($conn in $staleConnections) {
        if ($conn.OwningProcess -and $conn.OwningProcess -ne $PID) {
            try {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "  Released port $($conn.LocalPort) (PID $($conn.OwningProcess))" -ForegroundColor DarkGray
            } catch {}
        }
    }
    Start-Sleep -Milliseconds 500
}

# 1. Check Python Virtual Environment
if (-not $WebOnly) {
    if (-not (Test-Path $PythonExe)) {
        Write-Host "Creating Python virtual environment in $ApiDir\.venv..." -ForegroundColor Cyan
        Set-Location $ApiDir
        python -m venv .venv
        & $PythonExe -m pip install --upgrade pip
        & $PythonExe -m pip install -r requirements.txt
    }
}

# 2. Check Ollama Status
if (-not $WebOnly) {
    Write-Host "Checking local Ollama inference server..." -ForegroundColor Cyan
    try {
        $tags = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
        $hasGemma = $tags.models | Where-Object { $_.name -like "*gemma3:1b*" }
        if ($hasGemma) {
            Write-Host "  [OK] Ollama is active with gemma3:1b ready." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Ollama is online, but gemma3:1b was not found." -ForegroundColor Yellow
            Write-Host "         Run: ollama pull gemma3:1b" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [INFO] Ollama is currently offline or unreachable." -ForegroundColor DarkYellow
        Write-Host "         Phantom Dependency will use deterministic heuristic explanations." -ForegroundColor DarkGray
        Write-Host "         To enable AI: Start Ollama and run: ollama pull gemma3:1b" -ForegroundColor DarkGray
    }
}

# 3. Launch Services
if ($ApiOnly) {
    Write-Host ""
    Write-Host "Starting FastAPI backend on http://127.0.0.1:8000..." -ForegroundColor Green
    Set-Location $ApiDir
    & $PythonExe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}
elseif ($WebOnly) {
    Write-Host ""
    Write-Host "Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Green
    Set-Location $WebDir
    pnpm dev
}
else {
    Write-Host ""
    Write-Host "Starting Phantom Dependency (Dual Stack)..." -ForegroundColor Green
    Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor DarkGray
    Write-Host ""

    # Start API in background job or secondary process
    $ApiProcess = Start-Process -FilePath $PythonExe -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $ApiDir -PassThru -NoNewWindow
    
    try {
        Set-Location $WebDir
        pnpm dev
    }
    finally {
        Write-Host "`nStopping backend process..." -ForegroundColor Yellow
        if ($ApiProcess -and -not $ApiProcess.HasExited) {
            Stop-Process -Id $ApiProcess.Id -Force
        }
    }
}
