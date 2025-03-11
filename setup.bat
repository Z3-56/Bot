@echo off
echo Setting up Educational Assistant Chatbot API Server...

REM Check Python version
python --version 2>NUL
if errorlevel 1 (
    echo Python is required but not installed. Aborting.
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file with your configuration
)

REM Check PostgreSQL
echo Checking PostgreSQL connection...
python -c "import psycopg2"
if errorlevel 1 (
    echo PostgreSQL connection failed. Please check your database configuration.
    exit /b 1
)

REM Initialize database
echo Initializing database...
python api_server.py init_db

echo Setup complete! You can now start the API server with:
echo python api_server.py 