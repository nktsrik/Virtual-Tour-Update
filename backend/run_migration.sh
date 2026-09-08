#!/bin/bash

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="virtual_tour_kebun_raya_new"
DB_USER="postgres"

echo "Running migration: add_favorites_and_audio.sql"

# Run the migration
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/add_favorites_and_audio.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed!"
    exit 1
fi
