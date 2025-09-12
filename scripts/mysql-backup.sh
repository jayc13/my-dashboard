#!/bin/bash

# MySQL Database Backup Script for Production
# This script creates a backup of the MySQL database and saves it to a temporary folder
# Usage: ./mysql-backup.sh [--skip-validation]

set -e  # Exit on any error

# Parse command line arguments
SKIP_VALIDATION=false
for arg in "$@"; do
    case $arg in
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--skip-validation] [--help]"
            echo "  --skip-validation  Skip database connection validation"
            echo "  --help, -h         Show this help message"
            exit 0
            ;;
        *)
            # Unknown option
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables from .env file
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    print_info "Loading environment variables from $ENV_FILE"
    # Safely load environment variables, handling quotes and special characters
    while IFS= read -r line; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Extract key and value, handling quotes properly
        if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Remove leading/trailing whitespace from key
            key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

            # Handle quoted values (remove outer quotes but preserve inner content)
            if [[ "$value" =~ ^\"(.*)\"$ ]]; then
                value="${BASH_REMATCH[1]}"
            elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
                value="${BASH_REMATCH[1]}"
            fi

            # Export the variable
            export "$key"="$value"
        fi
    done < "$ENV_FILE"
else
    print_warning ".env file not found at $ENV_FILE, using default values"
fi

# Database configuration with defaults
DB_HOST=${MYSQL_HOST:-localhost}
DB_PORT=${MYSQL_PORT:-3306}
DB_USER=${MYSQL_USER:-root}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE:-cypress_dashboard}

# Debug: Print connection details (without password)
print_info "Connection details:"
print_info "  Host: $DB_HOST"
print_info "  Port: $DB_PORT"
print_info "  User: $DB_USER"
print_info "  Database: $DB_NAME"
print_info "  Password: $([ -n "$DB_PASSWORD" ] && echo "[SET]" || echo "[NOT SET]")"

# Backup configuration
BACKUP_DIR="../data/mysql-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="${DB_NAME}_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Compressed backup filename
COMPRESSED_FILENAME="${DB_NAME}_backup_${TIMESTAMP}.sql.gz"
COMPRESSED_PATH="${BACKUP_DIR}/${COMPRESSED_FILENAME}"

# Function to check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v mysqldump &> /dev/null; then
        print_error "mysqldump is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        print_error "gzip is not installed or not in PATH"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to create backup directory
create_backup_directory() {
    print_info "Creating backup directory: $BACKUP_DIR"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Backup directory created"
    else
        print_info "Backup directory already exists"
    fi
}

# Function to perform the backup
perform_backup() {
    print_info "Starting MySQL database backup..."
    print_info "Database: $DB_NAME"
    print_info "Host: $DB_HOST:$DB_PORT"
    print_info "User: $DB_USER"
    print_info "Backup file: $BACKUP_FILENAME"

    # Create a temporary MySQL config file for secure password handling
    TEMP_CONFIG=$(mktemp)
    cat > "$TEMP_CONFIG" << EOF
[client]
host=$DB_HOST
port=$DB_PORT
user=$DB_USER
password=$DB_PASSWORD
EOF

    # Create the backup using mysqldump with config file
    mysqldump \
        --defaults-file="$TEMP_CONFIG" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --databases "$DB_NAME" > "$BACKUP_PATH"

    BACKUP_RESULT=$?

    # Clean up temporary config file immediately
    rm -f "$TEMP_CONFIG"

    if [ $BACKUP_RESULT -eq 0 ]; then
        print_success "Database backup completed successfully"

        # Get backup file size
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        print_info "Backup file size: $BACKUP_SIZE"
    else
        print_error "Database backup failed"
        exit 1
    fi
}

# Function to compress the backup
compress_backup() {
    print_info "Compressing backup file..."
    
    gzip "$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        print_success "Backup compressed successfully"
        
        # Get compressed file size
        COMPRESSED_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)
        print_info "Compressed file size: $COMPRESSED_SIZE"
        print_info "Compressed backup saved as: $COMPRESSED_FILENAME"
    else
        print_error "Failed to compress backup file"
        exit 1
    fi
}

# Function to clean up old backups (keep last 7 days)
cleanup_old_backups() {
    print_info "Cleaning up old backups (keeping last 7 days)..."
    
    # Find and delete backup files older than 7 days
    find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f -mtime +7 -delete
    
    if [ $? -eq 0 ]; then
        print_success "Old backups cleaned up successfully"
    else
        print_warning "Failed to clean up some old backup files"
    fi
}

# Function to display backup summary
display_summary() {
    echo ""
    print_success "=== BACKUP SUMMARY ==="
    echo "Database: $DB_NAME"
    echo "Timestamp: $TIMESTAMP"
    echo "Backup Location: $COMPRESSED_PATH"
    echo "Compressed Size: $(du -h "$COMPRESSED_PATH" | cut -f1)"
    echo "========================"
    echo ""
}

# Main execution
main() {
    print_info "Starting MySQL backup process..."
    echo ""
    
    check_dependencies

    create_backup_directory
    perform_backup
    compress_backup
    cleanup_old_backups
    display_summary
    
    print_success "MySQL backup process completed successfully!"
}

# Handle script interruption
trap 'print_error "Backup process interrupted"; exit 1' INT TERM

# Execute main function
main "$@"
