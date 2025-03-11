#!/bin/bash

# Install Node.js dependencies
npm install ioredis@5.3.2 compromise@14.12.0 @types/ioredis@5.0.0 @types/node@20.11.24 @types/compromise@11.14.4

# Create necessary directories
mkdir -p cache
mkdir -p logs

# Install Redis if not already installed (for Windows)
if ! command -v redis-server &> /dev/null; then
    echo "Redis not found. Please install Redis manually from https://github.com/microsoftarchive/redis/releases"
    echo "After installation, make sure Redis is running as a service"
fi

# Build TypeScript files
npm run build

echo "Setup complete! Make sure Redis is running before starting the application." 