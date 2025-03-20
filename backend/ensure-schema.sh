#!/bin/bash
set -e

# Log function with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Variables from environment
DB_HOST="${MYSQL_HOST:-mysql}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_NAME="${MYSQL_DB:-chimera-web-platform}"
DB_USER="${MYSQL_USER:-chimera-web-platform}"
DB_PASS="${MYSQL_PASSWORD:-secret}"

# Wait for MySQL to be ready
log "Waiting for MySQL to be available at $DB_HOST:$DB_PORT..."
max_retries=30
retry_count=0

while ! mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" --silent &> /dev/null; do
    retry_count=$((retry_count+1))
    
    if [ $retry_count -ge $max_retries ]; then
        log "ERROR: Failed to connect to MySQL after $max_retries attempts."
        exit 1
    fi
    
    log "MySQL not ready yet. Retry $retry_count/$max_retries..."
    sleep 2
done

log "MySQL is available. Proceeding with schema initialization..."

# Apply schema
log "Applying database schema from /var/www/schema/schema.sql..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < /var/www/schema/schema.sql

if [ $? -eq 0 ]; then
    log "Schema applied successfully."
else
    log "ERROR: Failed to apply schema."
    exit 1
fi

# Verify tables were created
TABLES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -s -N -e "SHOW TABLES FROM \`$DB_NAME\`" "$DB_NAME")

if echo "$TABLES" | grep -q "users" && echo "$TABLES" | grep -q "templates" && echo "$TABLES" | grep -q "template_downloads"; then
    log "Verification successful. All required tables exist."
else
    log "WARNING: Verification failed. Some tables may be missing."
    log "Tables found: $TABLES"
fi

log "Database initialization complete."