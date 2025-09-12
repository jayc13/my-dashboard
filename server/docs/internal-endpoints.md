# Internal Endpoints

This document describes the internal endpoints available in the Cypress Dashboard server.

## File System Endpoints

### List Data Directory Contents

**Endpoint:** `GET /api/internal/files`

**Description:** Lists all directories and files under the DATA_DIR environment variable path.

**Authentication:** Requires API key via `X-API-Key` header.

**Query Parameters:**
- `path` (optional): Relative path within DATA_DIR to list. Defaults to root directory.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "path": "/",
    "items": [
      {
        "name": "2025-09-10",
        "type": "directory",
        "path": "2025-09-10",
        "modified": "2025-09-10T17:41:44.686Z"
      },
      {
        "name": "database.sqlite",
        "type": "file",
        "path": "database.sqlite",
        "size": 57344,
        "modified": "2025-09-10T18:18:36.578Z"
      }
    ],
    "totalFiles": 3,
    "totalDirectories": 11
  }
}
```

**Example Usage:**
```bash
# List root directory
curl -H "X-API-Key: YOUR_API_KEY" "http://localhost:3000/api/internal/files"

# List specific subdirectory
curl -H "X-API-Key: YOUR_API_KEY" "http://localhost:3000/api/internal/files?path=2025-09-10"
```

**Error Responses:**
- `403 Forbidden`: Path is outside of allowed directory
- `404 Not Found`: Path does not exist
- `400 Bad Request`: Path is not a directory
- `500 Internal Server Error`: Server error

### Delete File or Directory

**Endpoint:** `DELETE /api/internal/files`

**Description:** Safely deletes allowed files or directories under the DATA_DIR environment variable path.

**Authentication:** Requires API key via `X-API-Key` header.

**Query Parameters:**
- `path` (required): Relative path within DATA_DIR to delete.

**Safety Rules:**
- **Protected Files**: Cannot delete critical files like `database.db`, `.env`, `config.json`, `package.json`
- **Allowed Extensions**: Only files with extensions `.json`, `.txt`, `.log`, `.tmp`, `.cache` can be deleted
- **Date Directories**: Directories matching pattern `YYYY-MM-DD` are considered safe to delete (cache/temp data)
- **Protected Directory Check**: Directories containing protected files cannot be deleted

**Response Format:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "path": "2025-09-10",
    "type": "directory",
    "message": "Directory deleted successfully"
  }
}
```

**Example Usage:**
```bash
# Delete a JSON file
curl -X DELETE -H "X-API-Key: YOUR_API_KEY" "http://localhost:3000/api/internal/files?path=old-data.json"

# Delete a date-based directory
curl -X DELETE -H "X-API-Key: YOUR_API_KEY" "http://localhost:3000/api/internal/files?path=2025-08-15"
```

**Error Responses:**
- `400 Bad Request`: Path parameter is required
- `403 Forbidden`: Path is outside of allowed directory, file is protected, or directory contains protected files
- `404 Not Found`: Path does not exist
- `500 Internal Server Error`: Server error

### Get Data Directory Information

**Endpoint:** `GET /api/internal/files/info`

**Description:** Returns information about the DATA_DIR configuration.

**Authentication:** Requires API key via `X-API-Key` header.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "dataDir": "/absolute/path/to/data",
    "exists": true,
    "isDirectory": true,
    "envVar": "./data"
  }
}
```

**Example Usage:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" "http://localhost:3000/api/internal/files/info"
```

## Security Features

- **Path Traversal Protection**: All endpoints prevent access to files outside the DATA_DIR using path traversal attacks (e.g., `../`, `../../`).
- **API Key Authentication**: All internal endpoints require a valid API key.
- **Protected File System**: Critical files are protected from deletion (database files, configuration files, etc.).
- **Extension Filtering**: Only specific file extensions are allowed for deletion to prevent accidental removal of important files.
- **Directory Safety Checks**: Directories containing protected files cannot be deleted.
- **Error Handling**: Proper error responses for various failure scenarios.

## Environment Variables

- `DATA_DIR`: The directory path to list files from. Defaults to `./data` if not set.
- `API_SECURITY_KEY`: The API key required for authentication.

## Implementation Details

The file system endpoints are implemented using:
- **Service**: `FileSystemService` - Handles file system operations with security checks
- **Controller**: `FileSystemController` - Handles HTTP requests and responses
- **Router**: `createInternalRouter()` - Defines the endpoint routes

The implementation includes:
- Recursive directory listing
- Safe file and directory deletion with multiple protection layers
- File size and modification date information
- Sorting (directories first, then files, both alphabetically)
- Comprehensive error handling
- Security validation to prevent directory traversal attacks
- Protected file detection and prevention
- Extension-based deletion filtering

### Protected Files List
The following files are automatically protected from deletion:
- `database.db`
- `.env`
- `config.json`
- `package.json`

### Allowed File Extensions for Deletion
Only files with these extensions can be deleted:
- `.json` (JSON data files)
- `.txt` (Text files)
- `.log` (Log files)
- `.tmp` (Temporary files)
- `.cache` (Cache files)

### Special Directory Handling
- Date-based directories (format: `YYYY-MM-DD`) are considered safe for deletion as they typically contain temporary/cache data
- Directories are recursively checked for protected files before deletion
