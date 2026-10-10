# Read-only checks. No API credentials are read, printed, or sent.
$ErrorActionPreference = 'SilentlyContinue'
$homeDir = Join-Path $env:LOCALAPPDATA 'hermes'
$exe = Join-Path $homeDir 'bin\hermes.exe'
$mainConfig = Join-Path $homeDir 'config.yaml'
$cavalryConfig = Join-Path $homeDir 'profiles\cavalry\config.yaml'
function Test-LocalModelConfig($path) {
  if (-not (Test-Path $path)) { return $false }
  $lines = @(Get-Content $path)
  return [bool](($lines -match '^  default: "qwen3\.5:0\.8b"').Count -gt 0 -and ($lines -match '^  provider: "ollama"').Count -gt 0)
}
function Get-LazyMcpCount($path) {
  if (-not (Test-Path $path)) { return 0 }
  return @((Get-Content $path) | Where-Object { $_ -match '^\s+lazy:\s+true\s*$' }).Count
}
$gatewayRunning = $false
try {
  $pidFile = (Get-Content (Join-Path $homeDir 'gateway.pid') -Raw | ConvertFrom-Json).pid
  $gatewayRunning = [bool](Get-Process -Id $pidFile -ErrorAction SilentlyContinue)
} catch {}
$modelAvailable = $false
try {
  $models = (Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 8).models
  $modelAvailable = [bool](@($models | Where-Object { $_.name -eq 'qwen3.5:0.8b' }).Count -gt 0)
} catch {}
$scheduledJobHealthy = $false
try {
  $jobs = (Get-Content (Join-Path $homeDir 'cron\jobs.json') -Raw | ConvertFrom-Json).jobs
  $scheduledJobHealthy = [bool](@($jobs | Where-Object { $_.enabled -and $_.last_status -eq 'ok' }).Count -gt 0)
} catch {}
$installed = Test-Path $exe
$mainReady = Test-LocalModelConfig $mainConfig
$cavalryReady = Test-LocalModelConfig $cavalryConfig
$mainLazy = Get-LazyMcpCount $mainConfig
$cavalryLazy = Get-LazyMcpCount $cavalryConfig
$freeRam = try { [Math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2) } catch { $null }
$basicReady = $installed -and $gatewayRunning -and $modelAvailable -and $mainReady -and $cavalryReady -and $scheduledJobHealthy
[pscustomobject]@{
  checked_at = Get-Date -Format o
  installed = $installed
  gateway_running = $gatewayRunning
  model_available = $modelAvailable
  main_profile_compatible = $mainReady
  cavalry_profile_compatible = $cavalryReady
  main_lazy_mcp_count = $mainLazy
  cavalry_lazy_mcp_count = $cavalryLazy
  scheduled_health_last_run_ok = $scheduledJobHealthy
  free_ram_gb = $freeRam
  basic_ready = $basicReady
  note = 'Basic readiness only. Does not validate customer orders, payments, automation tool calls, or inference speed.'
} | ConvertTo-Json
if (-not $basicReady) { exit 1 }
