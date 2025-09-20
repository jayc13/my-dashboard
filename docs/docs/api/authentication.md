# Authentication

My Dashboard API uses API key authentication to secure access to endpoints and protect against unauthorized usage.

## API Key Authentication

### How It Works

API keys are passed via the `x-api-key` HTTP header:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/api/apps"
```

### Security Features

- **Constant-time comparison**: Prevents timing attacks
- **Rate limiting**: Protects against brute force attempts
- **IP-based blocking**: Automatic blocking of abusive IPs
- **Request logging**: Failed attempts are logged for monitoring

## Obtaining an API Key

API keys are configured server-side via the `API_SECURITY_KEY` environment variable. Contact your system administrator to:

1. **Request Access**: Provide your use case and required permissions
2. **Receive Key**: Get your unique API key securely
3. **Test Access**: Validate your key using the validation endpoint

## Validating Your API Key

Use the validation endpoint to test your API key:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"apiKey": "YOUR_API_KEY"}' \
     "http://localhost:3000/api/auth/validate"
```

**Success Response:**
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

**Error Response:**
```json
{
  "valid": false,
  "message": "Invalid API key"
}
```

## Rate Limiting & Protection

### Authentication Endpoints

Authentication endpoints have special protection:

- **Rate Limit**: 3 attempts per 15-minute window per IP
- **Progressive Delays**: Increasing delays after failed attempts
- **IP Blocking**: Temporary blocks for persistent abuse
- **Security Headers**: Additional security headers applied

### Failed Attempt Handling

When authentication fails:

1. **Attempt Recorded**: Failed attempt is logged with IP and timestamp
2. **Counter Incremented**: Failure count increases for the IP
3. **Delay Applied**: Progressive delay before next attempt allowed
4. **Blocking Triggered**: After threshold, IP is temporarily blocked

### Rate Limit Response

When rate limited, you'll receive:

```json
{
  "error": "Too many failed attempts. Try again in 10 minutes.",
  "retryAfter": 600
}
```

## Public Endpoints

These endpoints do not require authentication:

### Health Check
```bash
GET /health
```

No authentication required. Returns server status.

### API Key Validation
```bash
POST /api/auth/validate
```

Used to validate API keys. The key is provided in the request body, not headers.

## Protected Endpoints

All other endpoints require the `x-api-key` header:

- `/api/apps/*` - Application management
- `/api/e2e_reports/*` - E2E test reports
- `/api/pull_requests/*` - Pull request tracking
- `/api/notifications/*` - Notification management
- `/api/internal/*` - Internal administration

## Best Practices

### Secure Storage

- **Environment Variables**: Store API keys in environment variables
- **Secret Management**: Use proper secret management systems in production
- **Never Commit**: Never commit API keys to version control

```bash
# Good: Environment variable
export MY_DASHBOARD_API_KEY="your-key-here"

# Good: .env file (not committed)
MY_DASHBOARD_API_KEY=your-key-here

# Bad: Hardcoded in source
const apiKey = "abc123-secret-key"; // DON'T DO THIS
```

### Error Handling

Always handle authentication errors gracefully:

```javascript
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'x-api-key': process.env.MY_DASHBOARD_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      throw new Error('Invalid API key - check your credentials');
    }
    
    if (response.status === 429) {
      const data = await response.json();
      throw new Error(`Rate limited - retry after ${data.retryAfter} seconds`);
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error.message);
    throw error;
  }
}
```

### Retry Logic

Implement proper retry logic for rate-limited requests:

```javascript
async function apiRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      if (error.message.includes('Rate limited') && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### Request Logging

Log API requests for debugging and monitoring:

```javascript
function logApiRequest(endpoint, method = 'GET', success = true) {
  console.log(`[API] ${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`);
}
```

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Check that your API key is correct
- Verify the `x-api-key` header is being sent
- Ensure the key hasn't been revoked

**429 Too Many Requests**
- Wait for the retry period to expire
- Implement exponential backoff in your client
- Check if your IP has been temporarily blocked

**403 Forbidden**
- Your API key may not have permission for this endpoint
- Contact your administrator to verify permissions

### Testing Authentication

Use these commands to test your authentication setup:

```bash
# Test health endpoint (no auth required)
curl "http://localhost:3000/health"

# Test API key validation
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"apiKey": "YOUR_API_KEY"}' \
     "http://localhost:3000/api/auth/validate"

# Test protected endpoint
curl -H "x-api-key: YOUR_API_KEY" \
     "http://localhost:3000/api/apps"
```

### Debug Headers

Include debug information in your requests:

```bash
curl -v \
     -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/api/apps"
```

The `-v` flag shows request/response headers for debugging.

## Security Considerations

- **HTTPS Only**: Always use HTTPS in production
- **Key Rotation**: Regularly rotate API keys
- **Monitoring**: Monitor for unusual API usage patterns
- **Logging**: Keep audit logs of API access
- **Principle of Least Privilege**: Only grant necessary permissions
