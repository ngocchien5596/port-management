# ============================================
# Port Management System Startup Script
# ============================================

$ROOT = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHỞI ĐỘNG PORT MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. Dọn dẹp tiến trình
Write-Host "[0/4] Đang dọn dẹp tiến trình & kiểm tra Docker..." -ForegroundColor Magenta

# Kill all node.exe/tsx.exe to release locks
Write-Host "  Tắt tất cả node.exe/tsx.exe..." -ForegroundColor Gray
Get-Process -Name "node", "tsx" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue 2>$null

# Wait for processes to fully terminate
Start-Sleep -Seconds 2

# Kill by port (4000 and 3000)
$ports = @(4000, 3000)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId -and $processId -ne 0) {
                Write-Host "  Stopping process on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {}
}

# 1. Check Docker Container
$containerName = "port-mgmt-db"
$dockerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
if ($dockerStatus -ne "true") {
    Write-Host "⚠️  Container $containerName is not running. Starting it now..." -ForegroundColor Yellow
    docker-compose up -d
}
else {
    Write-Host "✅ Database container is running." -ForegroundColor Green
}

# 2. Regenerate Prisma Clients
Write-Host "[1/4] Đang cập nhật Prisma Client..." -ForegroundColor Magenta
Push-Location "$ROOT\apps\api"
npx prisma generate | Out-Null
Pop-Location

Start-Sleep -Seconds 1

# --- KHỞI ĐỘNG SERVICES ---

# 3. Port Management API (Port 4000)
Write-Host "[2/4] Khởi động Port Management API (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\apps\api'; Write-Host '🚀 Backend starting...'; pnpm dev"

Start-Sleep -Seconds 2

# 4. Port Management Web (Port 3000)
Write-Host "[3/4] Khởi động Port Management Web (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\apps\web'; Write-Host '🌐 Frontend starting...'; pnpm dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ĐÃ KHỞI ĐỘNG XONG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Truy cập:" -ForegroundColor Cyan
Write-Host "  - Handheld/Web:     http://localhost:3000" -ForegroundColor White
Write-Host "  - API Health:       http://localhost:4000/health" -ForegroundColor White
Write-Host "  - Adminer (DB):    http://localhost:8082" -ForegroundColor White
Write-Host ""
Write-Host "Ghi chú: Mỗi ứng dụng chạy trong một cửa sổ PowerShell riêng biệt." -ForegroundColor Gray
Write-Host ""
