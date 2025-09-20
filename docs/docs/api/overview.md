# API Overview

My Dashboard provides a comprehensive REST API for managing Cypress test results, applications, pull requests, notifications, and system administration.

## Base URL

```
http://localhost:3000  # Local development
https://api.mydashboard.example.com  # Production (example)
```

## Authentication

The API uses API key authentication via the `x-api-key` header for most endpoints.

```bash
curl -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/api/apps"
```

### Getting an API Key

API keys are configured via the `API_SECURITY_KEY` environment variable on the server. Contact your system administrator to obtain a valid API key.

### Public Endpoints

The following endpoints do not require authentication:
- `GET /health` - Health check endpoint
- `POST /api/auth/validate` - API key validation

## Rate Limiting

Authentication endpoints are protected with rate limiting:
- **Window**: 15 minutes
- **Max Attempts**: 3 per IP address
- **Brute Force Protection**: Progressive delays and IP blocking

## Response Format

All API responses follow a consistent format:

### Success Responses

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Responses

```json
{
  "error": "Error message describing what went wrong"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

## Data Formats

- **Dates**: ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **File Sizes**: Bytes (integer)
- **Booleans**: `true` or `false`
- **Content Type**: `application/json`

## API Categories

### 🏥 Health & Monitoring
- Health checks and system status

### 🔐 Authentication
- API key validation and security

### 🧪 E2E Testing
- Cypress test reports and project status
- Test run statistics and monitoring

### 📱 Applications
- Application/project management
- Pipeline configuration and monitoring

### 🔄 Pull Requests
- GitHub pull request tracking
- PR status and details

### 🔔 Notifications
- System alerts and notifications
- Push notification management

### 🗂️ Internal Administration
- File system management
- Data directory operations

## Getting Started

1. **Obtain an API Key**: Contact your administrator for a valid API key
2. **Test Connection**: Use the health endpoint to verify connectivity
3. **Validate API Key**: Use the auth validation endpoint to confirm your key works
4. **Explore Endpoints**: Browse the specific endpoint documentation for your use case

## OpenAPI Specification

The complete OpenAPI 3.1 specification is available at:
- **Local**: `http://localhost:3000/docs/api-documentation/openapi.yaml`
- **Interactive**: Import the specification into tools like Swagger UI or Postman

## SDKs and Tools

### cURL Examples

Basic authentication pattern:
```bash
export API_KEY="your-api-key-here"
curl -H "x-api-key: $API_KEY" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/api/apps"
```

### JavaScript/Node.js

```javascript
const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'your-api-key-here';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Example usage
const apps = await apiRequest('/api/apps');
```

### Python

```python
import requests

API_BASE_URL = 'http://localhost:3000'
API_KEY = 'your-api-key-here'

def api_request(endpoint, method='GET', data=None):
    headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    response = requests.request(
        method=method,
        url=f"{API_BASE_URL}{endpoint}",
        headers=headers,
        json=data
    )
    
    response.raise_for_status()
    return response.json()

# Example usage
apps = api_request('/api/apps')
```

## Support

For API support and questions:
- **Documentation**: Browse the detailed endpoint documentation
- **Issues**: Report bugs on the GitHub repository
- **Community**: Join discussions in the project repository
