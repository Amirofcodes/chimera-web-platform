#!/bin/bash
set -e

# (Any existing initialization code remains here.)
# For example, you might already have some setup or configuration here.

# If MINIMAL_API mode is enabled, run the PHP built-in server.
if [ "$MINIMAL_API" = "1" ]; then
  echo "Starting minimal API using PHP built-in server..."
  # Change directory to the document root if needed.
  cd /var/www/html
  # Start PHP built-in server on port 80
  exec php -S 0.0.0.0:80 -t /var/www/html
fi

# Otherwise, run the default php-fpm command.
echo "Starting PHP-FPM..."
exec php-fpm
