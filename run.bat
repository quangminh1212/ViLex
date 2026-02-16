@echo off
chcp 65001 >nul 2>&1
title VietDoc Pro - Dev Server
color 0A

echo ========================================
echo   VietDoc Pro - Development Server
echo ========================================
echo.

:: Kiem tra Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [LOI] Node.js chua duoc cai dat!
    echo Tai tai: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Hien thi phien ban
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [OK] Node.js %NODE_VER% / npm v%NPM_VER%
echo.

:: Cai dat dependencies neu chua co
if not exist "node_modules" (
    echo [..] Cai dat dependencies lan dau...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [LOI] Cai dat that bai!
        pause
        exit /b 1
    )
    echo [OK] Cai dat thanh cong!
) else (
    echo [OK] Dependencies da san sang
)
echo.

:: Khoi chay dev server
echo [*] Khoi chay dev server...
echo [*] Vite HMR tu dong cap nhat khi code thay doi
echo [*] Nhan Ctrl+C de dung server
echo ----------------------------------------
echo.

call npm run dev
