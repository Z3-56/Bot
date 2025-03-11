@echo off
echo Installing dependencies...
call npm install ioredis@5.3.2 compromise@14.12.0 @types/ioredis@5.0.0 @types/node@20.11.24 @types/compromise@11.14.4

echo Creating directories...
mkdir cache 2>nul
mkdir logs 2>nul

echo Checking Redis installation...
redis-cli --version >nul 2>&1
if errorlevel 1 (
    echo Redis not found. Please install Redis manually from https://github.com/microsoftarchive/redis/releases
    echo After installation, make sure Redis is running as a service
)

echo Building TypeScript files...
call npm run build

echo Setup complete! Make sure Redis is running before starting the application.
pause 