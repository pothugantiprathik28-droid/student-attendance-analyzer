@echo off
title Student Attendance Analyzer - MySQL Database Setup
echo ========================================================
echo   Student Attendance Analyzer - MySQL Schema & Seed Setup
echo ========================================================
echo.
set /p DB_USER="Enter MySQL Username [default: root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Enter MySQL Password (press Enter if blank): "

echo.
echo [1/2] Creating database and tables from schema.sql...
if "%DB_PASS%"=="" (
    mysql -u %DB_USER% < schema.sql
) else (
    mysql -u %DB_USER% -p%DB_PASS% < schema.sql
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to execute schema.sql. Please ensure MySQL service is running.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Populating seed dataset from seed.sql...
if "%DB_PASS%"=="" (
    mysql -u %DB_USER% < seed.sql
) else (
    mysql -u %DB_USER% -p%DB_PASS% < seed.sql
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to execute seed.sql.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [SUCCESS] MySQL Database `attendance_db` initialized!
echo You can now start the backend server with:
echo   start_server.bat
echo ========================================================
pause
