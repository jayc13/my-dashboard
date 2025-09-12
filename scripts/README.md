# Scripts - Utility and Automation Tools

This folder contains essential utility scripts for the Cypress Dashboard project, providing automation for deployment, configuration management, and database operations.

## 🚀 Technology Stack

### Core Technologies
- **Bash Scripting** - Shell automation for deployment and backup
- **Node.js** - JavaScript utilities for configuration management
- **MySQL Client Tools** - Database backup and management
- **System Integration** - macOS/Linux system notifications and utilities

### Key Dependencies
- **dotenv 17.2.2** - Environment variable management
- **Node.js** - Runtime for JavaScript utilities
- **MySQL Client** - Database connectivity tools
- **terminal-notifier** - macOS system notifications (optional)

## 📁 Project Structure

```
scripts/
├── README.md                    # This documentation
├── local_deploy.sh             # Local deployment automation
├── inject-firebase-config.js   # Firebase configuration injection
├── mysql-backup.sh             # Database backup utility
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lock file
├── node_modules/               # Node.js modules (generated)
└── .env                        # Environment variables (create if needed)
```

## Available Scripts

### 1. Local Deployment Script (`local_deploy.sh`)
### 2. Firebase Configuration Injection (`inject-firebase-config.js`)
### 3. MySQL Database Backup (`mysql-backup.sh`)

---

## Local Deployment Script

### Overview
The `local_deploy.sh` script automates the local deployment process for the Cypress Dashboard. It builds the client application and deploys it to a local web server directory.

### Features
- ✅ Automatic dependency installation
- ✅ Code linting validation
- ✅ Client application building
- ✅ Environment variable injection
- ✅ Automatic cleanup of old versions
- ✅ System notifications (macOS)
- ✅ Colored output for better readability

### Usage

#### Basic Usage
```bash
cd scripts
./local_deploy.sh
```

#### Custom Deployment Directory
```bash
./local_deploy.sh --deploy-dir=/custom/path/to/www
```

#### Default Configuration
- **Default WWW Directory**: `/opt/homebrew/var/www`
- **Dashboard URL**: `https://localhost`

### Process Steps
1. **Dependency Installation** - Installs npm packages
2. **Linting** - Runs code quality checks
3. **Building** - Compiles the client application
4. **Environment Injection** - Replaces environment variables
5. **Cleanup** - Removes old deployment files
6. **Deployment** - Copies new files to web directory

### Prerequisites
- Node.js and npm installed
- Access to the deployment directory
- Optional: `terminal-notifier` for macOS notifications (`brew install terminal-notifier`)

---

## Firebase Configuration Injection

### Overview
The `inject-firebase-config.js` script injects Firebase configuration into the service worker file during the build process.

### Features
- ✅ Environment variable support
- ✅ Automatic configuration injection
- ✅ Service worker file modification
- ✅ JSON configuration formatting

### Usage

#### Direct Execution
```bash
cd scripts
node inject-firebase-config.js
```

#### Via npm Script
```bash
cd scripts
npm run replace-env
```

### Environment Variables Required
The script reads from `scripts/.env`:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

### Process
1. Reads Firebase configuration from environment variables
2. Locates the service worker file (`../client/dist/sw.js`)
3. Replaces the Firebase config block in the service worker
4. Saves the updated service worker file

### Prerequisites
- Built client application (service worker file must exist)
- Environment variables configured in `scripts/.env`
- Node.js installed

---

## MySQL Backup Script

### Overview
The `mysql-backup.sh` script creates automated backups of the MySQL database in production. It saves compressed backups to a temporary folder that is ignored by git.

### Features
- ✅ Automatic database connection validation with timeout
- ✅ Network connectivity checks before attempting connection
- ✅ Secure password handling (no command-line exposure)
- ✅ Compressed backups (gzip) to save space
- ✅ Automatic cleanup of old backups (keeps last 7 days)
- ✅ Colored output for better readability
- ✅ Comprehensive error handling and debugging
- ✅ Environment variable support with special character handling
- ✅ Backup integrity checks
- ✅ Command-line options for flexibility

### Prerequisites
- `mysqldump` command-line tool
- `gzip` for compression
- `netcat` (nc) for network connectivity checks (optional)
- Access to the MySQL database
- Proper environment variables configured

### Usage

#### Basic Usage
```bash
cd scripts
./mysql-backup.sh
```

#### Command Line Options
```bash
# Basic backup
./mysql-backup.sh

# Skip connection validation (useful for troubleshooting)
./mysql-backup.sh --skip-validation

# Show help
./mysql-backup.sh --help
```

#### Environment Variables
The script reads configuration from `../server/.env` file. Required variables:
- `MYSQL_HOST` - Database host (default: localhost)
- `MYSQL_PORT` - Database port (default: 3306)
- `MYSQL_USER` - Database username (default: root)
- `MYSQL_PASSWORD` - Database password (required)
- `MYSQL_DATABASE` - Database name (default: cypress_dashboard)

**Special Character Support:**
The script properly handles passwords and values containing:
- Double quotes (`"`)
- Single quotes (`'`)
- Spaces
- Special characters (`!@#$%^&*()`)
- Escape sequences

**Example .env format:**
```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD="MyP@ssw0rd!WithSpecial\"Chars"
MYSQL_DATABASE=cypress_dashboard
```

#### Backup Location
Backups are saved to: `../data/mysql-backups/`

#### Backup Naming Convention
- Format: `{database_name}_backup_{timestamp}.sql.gz`
- Example: `cypress_dashboard_backup_20241211_143022.sql.gz`

#### Automatic Cleanup
The script automatically removes backup files older than 7 days to prevent disk space issues.

### Example Output
```
[INFO] Starting MySQL backup process...

[INFO] Loading environment variables from ../server/.env
[INFO] Connection details:
[INFO]   Host: localhost
[INFO]   Port: 3306
[INFO]   User: root
[INFO]   Database: cypress_dashboard
[INFO]   Password: [SET]
[INFO] Checking dependencies...
[SUCCESS] All dependencies are available
[INFO] Validating database connection...
[INFO] Checking network connectivity to localhost:3306...
[SUCCESS] Network connectivity confirmed
[INFO] Testing MySQL authentication...
[SUCCESS] Database connection validated successfully
[INFO] Creating backup directory: ../data/mysql-backups
[INFO] Backup directory already exists
[INFO] Starting MySQL database backup...
[INFO] Database: cypress_dashboard
[INFO] Host: localhost:3306
[INFO] User: root
[INFO] Backup file: cypress_dashboard_backup_20241211_143022.sql
[SUCCESS] Database backup completed successfully
[INFO] Backup file size: 2.1M
[INFO] Compressing backup file...
[SUCCESS] Backup compressed successfully
[INFO] Compressed file size: 456K
[INFO] Compressed backup saved as: cypress_dashboard_backup_20241211_143022.sql.gz
[INFO] Cleaning up old backups (keeping last 7 days)...
[SUCCESS] Old backups cleaned up successfully

[SUCCESS] === BACKUP SUMMARY ===
Database: cypress_dashboard
Timestamp: 20241211_143022
Backup Location: ../data/mysql-backups/cypress_dashboard_backup_20241211_143022.sql.gz
Compressed Size: 456K
========================

[SUCCESS] MySQL backup process completed successfully!
```

### Troubleshooting

#### Common Issues

1. **Permission denied**: Make sure the script is executable (`chmod +x mysql-backup.sh`)
2. **mysqldump not found**: Install MySQL client tools
3. **Connection timeout**: Database server may not be running or accessible
4. **Network connectivity**: Cannot reach database host/port
5. **Authentication failed**: Check database credentials
6. **Disk space**: Ensure sufficient space in the backup directory

#### Error Messages and Solutions

- `Database password is not set`: Set `MYSQL_PASSWORD` in your `.env` file
- `Cannot reach host:port`: Check if MySQL server is running and accessible
- `Connection timed out`: Database server may be down or network issues
- `mysqldump is not installed`: Install MySQL client tools
- `Authentication failed`: Verify database credentials

#### Debugging Steps

1. **Check connection details**: The script shows connection parameters (host, port, user, database)
2. **Test network connectivity**: Script automatically checks if the port is reachable
3. **Skip validation**: Use `--skip-validation` to bypass connection checks
4. **Check MySQL server**: Ensure MySQL service is running
5. **Verify credentials**: Double-check username and password in `.env` file

#### Timeout Handling

The script includes built-in timeouts to prevent hanging:
- **Network connectivity check**: 5 seconds
- **MySQL connection test**: 10 seconds with 5-second connect timeout
- **Backup operation**: Uses MySQL's built-in timeouts

### Security Notes
- **Secure credential handling**: Uses temporary MySQL config files instead of command-line passwords
- **No password exposure**: Database passwords are never displayed in output or process lists
- **Environment variables**: Credentials stored in `.env` files, not hardcoded
- **Temporary file cleanup**: Config files are immediately deleted after use
- **Git-ignored storage**: Backup files are stored in directories ignored by version control
- **Special character support**: Properly handles passwords with quotes, spaces, and special characters

---

## Script Dependencies

### Package.json Configuration
The scripts directory includes its own `package.json` for managing Node.js dependencies:

```json
{
  "name": "my-dashboard-scripts",
  "version": "1.0.0",
  "scripts": {
    "replace-env": "node inject-firebase-config.js"
  },
  "dependencies": {
    "dotenv": "^17.2.2"
  }
}
```

### Installing Script Dependencies
```bash
cd scripts
npm install
```

---

## General Usage Guidelines

### File Permissions
Make sure shell scripts are executable:
```bash
chmod +x local_deploy.sh
chmod +x mysql-backup.sh
```

### Environment Variables
- **Local Deploy & Firebase**: Use `scripts/.env` for Firebase configuration
- **MySQL Backup**: Uses `server/.env` for database configuration

### Directory Structure
```
scripts/
├── README.md                    # This documentation
├── local_deploy.sh             # Local deployment automation
├── inject-firebase-config.js   # Firebase config injection
├── mysql-backup.sh             # Database backup utility
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lock file
├── node_modules/               # Node.js modules
└── .env                        # Environment variables (create if needed)
```

### Common Troubleshooting

#### Permission Issues
```bash
# Make scripts executable
chmod +x *.sh
```

#### Missing Dependencies
```bash
# Install Node.js dependencies
cd scripts && npm install

# Install system dependencies (macOS)
brew install mysql-client terminal-notifier
```

#### Environment Variables
- Create `scripts/.env` for Firebase configuration
- Ensure `server/.env` exists for database configuration
- Check that all required variables are set

### Integration with Development Workflow

1. **Local Development**: Use `local_deploy.sh` for testing deployments
2. **Build Process**: `inject-firebase-config.js` is called during client builds
3. **Database Maintenance**: Run `mysql-backup.sh` regularly for data protection
4. **CI/CD**: Scripts can be integrated into automated deployment pipelines

## 🔧 Advanced Usage

### Automated Deployment Pipeline
Combine scripts for complete deployment automation:

```bash
#!/bin/bash
# Complete deployment pipeline example

# 1. Backup database before deployment
./mysql-backup.sh

# 2. Deploy application
./local_deploy.sh --deploy-dir=/var/www/dashboard

# 3. Verify deployment
curl -f http://localhost/health || exit 1

echo "Deployment completed successfully!"
```

### Scheduled Backups
Set up automated database backups with cron:

```bash
# Add to crontab (crontab -e)
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/mysql-backup.sh

# Weekly backup with email notification
0 2 * * 0 /path/to/scripts/mysql-backup.sh && echo "Weekly backup completed" | mail -s "Database Backup" admin@company.com
```

### Environment-Specific Configurations
Use different configurations for different environments:

```bash
# Development deployment
./local_deploy.sh --env=development

# Staging deployment
./local_deploy.sh --env=staging --deploy-dir=/var/www/staging

# Production deployment (with extra validation)
./local_deploy.sh --env=production --validate --backup
```

## 🔐 Security Considerations

### Environment Variables
- Store sensitive data in `.env` files, not in scripts
- Use proper file permissions (600) for `.env` files
- Never commit `.env` files to version control
- Rotate API keys and passwords regularly

### Script Permissions
```bash
# Set proper permissions for scripts
chmod 755 *.sh                    # Executable by owner, readable by others
chmod 600 .env                    # Readable only by owner
chmod 644 *.js                    # Readable by all, writable by owner
```

### Database Security
- Use dedicated backup user with minimal permissions
- Encrypt backup files for sensitive data
- Store backups in secure, access-controlled locations
- Implement backup retention policies

## 📊 Monitoring and Logging

### Script Execution Logging
Add logging to track script execution:

```bash
# Example logging in deployment script
LOG_FILE="/var/log/deployment.log"
echo "$(date): Starting deployment" >> $LOG_FILE
./local_deploy.sh 2>&1 | tee -a $LOG_FILE
echo "$(date): Deployment completed" >> $LOG_FILE
```

### Backup Monitoring
Monitor backup success and failures:

```bash
# Check backup status
if [ $? -eq 0 ]; then
    echo "Backup successful: $(date)" >> /var/log/backup.log
else
    echo "Backup failed: $(date)" >> /var/log/backup.log
    # Send alert notification
fi
```

### Performance Metrics
Track script performance:

```bash
# Time script execution
start_time=$(date +%s)
./local_deploy.sh
end_time=$(date +%s)
duration=$((end_time - start_time))
echo "Deployment took ${duration} seconds"
```

## 🧪 Testing Scripts

### Local Testing
Test scripts in safe environments before production use:

```bash
# Test deployment to temporary directory
./local_deploy.sh --deploy-dir=/tmp/test-deployment --dry-run

# Test backup with test database
MYSQL_DATABASE=test_db ./mysql-backup.sh --skip-validation

# Test Firebase config injection
node inject-firebase-config.js --dry-run
```

### Validation Scripts
Create validation scripts to verify operations:

```bash
#!/bin/bash
# validate-deployment.sh
# Validates successful deployment

# Check if files exist
if [ ! -f "/var/www/index.html" ]; then
    echo "ERROR: Deployment files not found"
    exit 1
fi

# Check if service is running
if ! curl -f http://localhost/health; then
    echo "ERROR: Service health check failed"
    exit 1
fi

echo "Deployment validation successful"
```

## 🔄 Maintenance and Updates

### Script Versioning
- Use semantic versioning for script releases
- Maintain changelog for script modifications
- Test scripts thoroughly before deploying updates
- Keep backup copies of working script versions

### Dependency Management
```bash
# Update Node.js dependencies
cd scripts
npm audit fix
npm update

# Check for outdated packages
npm outdated
```

### Documentation Updates
- Keep README.md updated with script changes
- Document new features and breaking changes
- Include examples for new functionality
- Update troubleshooting guides as needed

## 📚 Extended Resources

### Learning Resources
- [Bash Scripting Guide](https://tldp.org/LDP/Bash-Beginners-Guide/html/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Best Practices
- [Shell Scripting Best Practices](https://google.github.io/styleguide/shellguide.html)
- [Database Backup Strategies](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)
- [Environment Variable Security](https://12factor.net/config)
- [Deployment Automation](https://martinfowler.com/articles/continuousIntegration.html)

### Tools and Utilities
- [ShellCheck](https://www.shellcheck.net/) - Shell script analysis
- [jq](https://stedolan.github.io/jq/) - JSON processing
- [envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html) - Environment variable substitution
- [parallel](https://www.gnu.org/software/parallel/) - Parallel execution
