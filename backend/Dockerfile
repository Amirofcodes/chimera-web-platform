FROM php:8.1-fpm

# Install system dependencies
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

WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock* /var/www/html/

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies via Composer
RUN composer install --no-dev --optimize-autoloader

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Create necessary directories for logs and set permissions
RUN mkdir -p /var/log/nginx /var/log/php \
    && touch /var/log/nginx/error.log /var/log/nginx/access.log /var/log/php/fpm-error.log \
    && chown -R www-data:www-data /var/log/nginx /var/log/php \
    && chmod 755 /var/log/nginx /var/log/php

# Copy configuration files and entrypoint
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy application source code
COPY src/ /var/www/html/

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
