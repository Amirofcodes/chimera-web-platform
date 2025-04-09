# Use the official PHP 8.1 FPM image as the base image
FROM php:8.1-fpm

# Install required system dependencies and PHP extensions:
# - nginx: Web server to serve the application.
# - libpng-dev, libjpeg-dev, libfreetype6-dev: Libraries for image processing.
# - zip & unzip: Tools to handle compressed files.
# - curl: Tool to fetch files from the internet (used to install Composer).
# Then, install the pdo_mysql extension for MySQL support and configure/install the GD extension for image handling.
RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy Composer configuration files into the working directory.
# This is done before running composer install to utilize Docker's layer caching.
COPY composer.json composer.lock* /var/www/html/

# Install Composer, a dependency manager for PHP, and place it in the /usr/local/bin directory.
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer require stripe/stripe-php
# Install PHP dependencies using Composer.
# The options --no-dev and --optimize-autoloader are used to optimize for production.
RUN composer install --no-dev --optimize-autoloader

# Configure PHP for production by moving the production php.ini file to the expected location.
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Create directories for log files and set appropriate permissions.
# This ensures that both nginx and PHP-FPM have directories to write their logs.
RUN mkdir -p /var/log/nginx /var/log/php \
    && touch /var/log/nginx/error.log /var/log/nginx/access.log /var/log/php/fpm-error.log \
    && chown -R www-data:www-data /var/log/nginx /var/log/php \
    && chmod 755 /var/log/nginx /var/log/php

# Copy configuration files for nginx and PHP-FPM, as well as a custom PHP configuration.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Copy the Docker entrypoint script and make sure it is executable.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy the application source code into the container.
COPY src/ /var/www/html/

# Expose port 80 to allow external access to the web server.
EXPOSE 80

# Define the entrypoint for the container.
ENTRYPOINT ["docker-entrypoint.sh"]




