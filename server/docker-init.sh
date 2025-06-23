#!/bin/sh

# Check if database exists
if [ ! -f /app/db-data/database.sqlite ]; then
    echo "Database not found. Initializing database..."
    # Create directory if it doesn't exist
    mkdir -p /app/db-data
    
    # Run database initialization scripts
    node /app/init-db.js
    node /app/utils/adminSeeder.js
    node /app/utils/seeder.js
    node /app/update-stations.js
    
    # Move database to persistent volume
    if [ -f /app/database.sqlite ]; then
        cp /app/database.sqlite /app/db-data/
        echo "Database initialized and moved to persistent storage."
    else
        echo "Error: Database initialization failed."
        exit 1
    fi
else
    echo "Database already exists."
fi

# Start the server
npm run dev
