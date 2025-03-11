#!/bin/bash

echo "Setting up Educational Assistant Chatbot API Server..."

# Check Python version
python3 --version || { echo "Python 3 is required but not installed. Aborting."; exit 1; }

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Check PostgreSQL
echo "Checking PostgreSQL connection..."
python -c "import psycopg2" || { echo "PostgreSQL connection failed. Please check your database configuration."; exit 1; }

# Initialize database
echo "Initializing database..."
python api_server.py init_db

echo "Setup complete! You can now start the API server with:"
echo "python api_server.py" 