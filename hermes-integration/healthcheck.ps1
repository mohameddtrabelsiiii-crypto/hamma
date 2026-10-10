# Read-only, secret-free Hermes readiness check for Windows PowerShell.
$ErrorActionPreference = 'SilentlyContinue'
$h = Join-Path $env:LOCALAPPDATA 'hermes'
$exe = Join-Path $h 'bin\hermes.exe'
$installed = Test-Path $exe
$gatewayRunning = $false
try {
  $gatewayPid = (Get-Content (Join-Path $h 'gateway.pid') -Raw | ConvertFrom-Json).pid
  $gatewayRunning = [bool](Get-Process -Id $gatewayPid -ErrorAction SilentlyContinue)
} catch {}
$modelAvailable = $false
try {
  $tags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 8
  $modelAvailable = [bool](@($tags.models | Where-Object { $_.name -eq 'qwen2.5:1.5b' }).Count -gt 0)
} catch {}
$config = @(Get-Content (Join-Path $h 'config.yaml'))
$localConfigured = [bool](($config -match '^  default: "qwen2\.5:1\.5b"').Count -gt 0 -and ($config -match '^  provider: "ollama"').Count -gt 0)
$jobHealthy = $false
try {
  $jobs = (Get-Content (Join-Path $h 'cron\jobs.json') -Raw | ConvertFrom-Json).jobs
  $jobHealthy = [bool](@($jobs | Where-Object { $_.enabled -eq $true -and $_.last_status -eq 'ok' }).Count -gt 0)
} catch {}
$report = [pscustomobject]@{
  timestamp = (Get-Date -Format o)
  timezone = (Get-TimeZone).Id
  hermes_installed = $installed
  gateway_running = $gatewayRunning
  local_model_available = $modelAvailable
  local_model_configured = $localConfigured
  scheduled_job_last_run_ok = $jobHealthy
  core_ready = ($installed -and $gatewayRunning -and $modelAvailable -and $localConfigured)
}
$report | ConvertTo-Json
if (-not $report.core_ready) { exit 1 }
