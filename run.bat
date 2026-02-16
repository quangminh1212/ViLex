@echo off
chcp 65001 >nul 2>&1
title VietDoc Pro
color 0A

echo ========================================
echo   VietDoc Pro - Launcher
echo ========================================
echo.

:: Kiem tra Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [LOI] Node.js chua duoc cai dat!
    echo Tai tai: https://nodejs.org/
    pause
    exit /b 1
)

:: Hien thi phien ban
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [OK] Node.js %NODE_VER% / npm v%NPM_VER%

:: Kiem tra Rust (can cho Tauri)
where rustc >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Rust chua cai. Chi chay duoc che do web.
    echo     Cai Rust tai: https://rustup.rs/
    set HAS_RUST=0
) else (
    for /f "tokens=*" %%i in ('rustc --version') do set RUST_VER=%%i
    echo [OK] %RUST_VER%
    set HAS_RUST=1
)
echo.

:: Cai dat dependencies
if not exist "node_modules" (
    echo [..] Cai dat dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [LOI] npm install that bai!
        pause
        exit /b 1
    )
    echo [OK] Cai dat thanh cong!
    echo.
)

:: Menu chon che do
echo ----------------------------------------
echo   Chon che do khoi chay:
echo ----------------------------------------
echo   1. Desktop App (Tauri - Khuyen dung)
echo   2. Web Browser (Vite Dev Server)
echo ----------------------------------------

if "%HAS_RUST%"=="0" (
    echo.
    echo   [!] Rust chua cai - tu dong chay Web
    set MODE=2
    goto run
)

set /p MODE="  Nhap lua chon (1/2): "

:run
echo.

if "%MODE%"=="1" (
    echo [*] Khoi chay Desktop App...
    echo [*] Vite HMR tu dong cap nhat khi code thay doi
    echo [*] Dong cua so app hoac Ctrl+C de dung
    echo.
    call npm run tauri:dev
) else (
    echo [*] Khoi chay Web Dev Server...
    echo [*] Vite HMR tu dong cap nhat khi code thay doi
    echo [*] Nhan Ctrl+C de dung
    echo.
    call npm run dev
)
