#!/bin/sh
set -e

echo "Starting ChimeraStack Backend..."

# Create required directories and set permissions
mkdir -p /var/log/nginx
mkdir -p /var/log/php
touch /var/log/nginx/error.log
touch /var/log/nginx/access.log
touch /var/log/php/fpm-error.log
chown -R www-data:www-data /var/log/nginx
chown -R www-data:www-data /var/log/php
chmod 755 /var/log/nginx
chmod 755 /var/log/php

# Ensure downloads directory exists and has proper permissions
mkdir -p /var/www/html/downloads
chown -R www-data:www-data /var/www/html/downloads
chmod 755 /var/www/html/downloads

# Install pgrep
apt-get update && apt-get install -y procps

# Set environment variables in PHP custom.ini if they exist
if [ ! -z "$PHP_ENVIRONMENT" ]; then
    echo "Setting PHP environment to: $PHP_ENVIRONMENT"
    sed -i "s/display_errors = .*/display_errors = On/g" /usr/local/etc/php/conf.d/custom.ini
    
    if [ "$PHP_ENVIRONMENT" = "production" ]; then
        sed -i "s/display_errors = .*/display_errors = Off/g" /usr/local/etc/php/conf.d/custom.ini
    fi
fi

# Print PHP configuration for debugging
echo "PHP Configuration:"
php -i | grep "Configure Command"
php -i | grep "Scan this dir for additional .ini files"

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Wait for PHP-FPM to be ready
echo "Waiting for PHP-FPM to be ready..."
sleep 2

# Verify PHP-FPM is running (use ps instead of pgrep for compatibility)
if ps aux | grep -v grep | grep -q php-fpm; then
    echo "PHP-FPM started successfully"
else
    echo "ERROR: PHP-FPM failed to start"
    exit 1
fi

# Start Nginx
echo "Starting Nginx..."
nginx -t && nginx -g "daemon off;"