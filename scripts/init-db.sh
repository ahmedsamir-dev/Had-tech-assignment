#!/bin/bash
set -e

echo "🔄 Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Apply migrations using drizzle
echo "🚀 Applying database migrations..."
if pnpm drizzle-kit migrate; then
  echo "✅ Migrations applied successfully!"
else
  echo "❌ Failed to apply migrations"
  exit 1
fi

# Seed device types
echo "🌱 Seeding device types..."
psql "$DATABASE_URL" -f scripts/seed-device-types.sql

# Seed test data in development
if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "local" ]; then
  echo "🌱 Seeding test data..."
  psql "$DATABASE_URL" -f scripts/seed-simple-test-data.sql
fi

echo "🎉 Database initialization complete!"
