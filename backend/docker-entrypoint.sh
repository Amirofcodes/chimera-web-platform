#!/bin/bash
# Exit immediately if any command exits with a non-zero status.
set -e

# ------------------------------------------------------------------------------
# Initialization and Custom Setup
# ------------------------------------------------------------------------------
# Place any additional initialization or configuration commands here.
# For example, you could perform environment variable checks or configure logging.

# ------------------------------------------------------------------------------
# Minimal API Mode: Run PHP Built-in Server
# ------------------------------------------------------------------------------
# If the environment variable MINIMAL_API is set to "1", this block will run.
# It starts the PHP built-in web server, which is useful for minimal API testing.
if [ "$MINIMAL_API" = "1" ]; then
  echo "Starting minimal API using PHP built-in server..."
  # Change directory to the document root.
  cd /var/www/html
  # Start the PHP built-in server on port 80, serving files from /var/www/html.
  exec php -S 0.0.0.0:80 -t /var/www/html
fi

# ------------------------------------------------------------------------------
# Database Schema Initialization
# ------------------------------------------------------------------------------
# If the environment variable INIT_DB is set to "1" (default value is 0 if not set),
# this block will execute to initialize or update the database schema.
if [ "${INIT_DB:-0}" = "1" ]; then
  echo "Initializing database schema..."
  # Execute the ensure-schema.sh script to set up the database.
  ensure-schema.sh
fi

# ------------------------------------------------------------------------------
# Start PHP-FPM
# ------------------------------------------------------------------------------
# If neither the minimal API mode nor database initialization is triggered,
# the script starts the default PHP-FPM process to serve PHP requests.
echo "Starting PHP-FPM..."
exec php-fpm
