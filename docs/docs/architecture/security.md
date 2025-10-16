# Security Architecture

Security is a top priority for My Dashboard. This document outlines the security measures implemented across the application to protect data, prevent unauthorized access, and ensure safe operation.

## Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal access rights
3. **Secure by Default** - Security built-in, not bolted-on
4. **Zero Trust** - Verify everything
5. **Fail Securely** - Graceful degradation

## Authentication

### API Key Authentication

The application uses API key-based authentication instead of JWT or session-based auth.

**Why API Keys?**
- Simpler implementation
- No session management needed
- Stateless authentication
- Easy to rotate
- Suitable for single-user dashboard

**Implementation:**

```typescript
// Client sends API key in header
headers: {
  'x-api-key': 'your-api-key-here'
}

// Server validates using constant-time comparison
const apiKey = req.header('x-api-key');
const validApiKey = process.env.API_SECURITY_KEY;

if (!apiKey || !crypto.timingSafeEqual(
  Buffer.from(apiKey),
  Buffer.from(validApiKey)
)) {
  throw new UnauthorizedError('Invalid API key');
}
```

**Security Features:**
- Constant-time comparison prevents timing attacks
- API key stored in environment variables
- Never logged or exposed in responses
- Transmitted only over HTTPS in production

### Brute Force Protection

Comprehensive protection against brute force attacks on authentication endpoints.

**Features:**

1. **Rate Limiting:**
   - Max 3 attempts per 15-minute window
   - IP-based tracking
   - Configurable via environment variables

2. **Progressive Slowdown:**
   - Adds delay after failed attempts
   - 1 second per failed attempt
   - Maximum 10-second delay
   - Only in production

3. **IP Blocking:**
   - Automatic blocking after 3 failed attempts
   - 30-minute block duration
   - In-memory tracking
   - Automatic unblocking

4. **Timing Attack Prevention:**
   - Random delay (50-150ms) on all auth requests
   - Prevents timing-based attacks
   - Constant-time comparisons

**Implementation:**

```typescript
class BruteForceProtection {
  private failedAttempts: Map<string, FailedAttempt>;
  private maxAttempts = 3;
  private windowMs = 15 * 60 * 1000; // 15 minutes
  private blockDurationMs = 30 * 60 * 1000; // 30 minutes

  checkBlocked(req, res, next) {
    const ip = this.getClientIP(req);
    const attempt = this.failedAttempts.get(ip);

    if (attempt?.blockedUntil && new Date() < attempt.blockedUntil) {
      const remainingTime = Math.ceil(
        (attempt.blockedUntil.getTime() - Date.now()) / 1000 / 60
      );
      return res.status(429).json({
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        retryAfter: remainingTime * 60,
      });
    }

    next();
  }

  recordFailedAttempt(req) {
    const ip = this.getClientIP(req);
    // ... increment counter and block if needed
  }

  clearFailedAttempts(req) {
    const ip = this.getClientIP(req);
    this.failedAttempts.delete(ip);
  }
}
```

## HTTP Security Headers

### Helmet.js Configuration

Helmet.js adds essential security headers to all responses:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Headers Applied:**

1. **Content-Security-Policy (CSP):**
   - Prevents XSS attacks
   - Restricts resource loading
   - Blocks inline scripts (except where needed)

2. **HTTP Strict Transport Security (HSTS):**
   - Forces HTTPS connections
   - 1-year max age
   - Includes subdomains
   - Preload ready

3. **X-Frame-Options:**
   - Prevents clickjacking
   - Set to `DENY`

4. **X-Content-Type-Options:**
   - Prevents MIME sniffing
   - Set to `nosniff`

5. **X-XSS-Protection:**
   - Legacy XSS protection
   - Set to `1; mode=block`

### Additional Security Headers

```typescript
// Custom security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};
```

## Input Validation

### Validation Strategy

All user input is validated before processing:

1. **Type Validation:**
   - TypeScript compile-time checks
   - Runtime type validation
   - Schema validation

2. **Sanitization:**
   - Remove dangerous characters
   - Escape HTML entities
   - Trim whitespace

3. **Business Logic Validation:**
   - Valid date ranges
   - Allowed values
   - Required fields

**Custom Validation Utilities:**

```typescript
// server/src/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

## SQL Injection Prevention

### Parameterized Queries

All database queries use parameterized statements:

```typescript
// ✅ SAFE - Parameterized query
const users = await db.all(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

// ❌ UNSAFE - String concatenation (never do this)
const users = await db.all(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Protection Mechanisms:**
- mysql2 library with prepared statements
- Parameter binding
- No string concatenation in queries
- Input validation before queries

## Cross-Origin Resource Sharing (CORS)

### CORS Configuration

```typescript
app.use(cors({
  origin: '*',  // Development: allow all origins
  methods: '*',
  allowedHeaders: '*',
}));
```

**Production Recommendations:**
```typescript
// Restrict to specific origins in production
app.use(cors({
  origin: [
    'https://mydashboard.com',
    'https://www.mydashboard.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true,
}));
```

## Data Protection

### Sensitive Data Handling

1. **API Keys:**
   - Stored in environment variables
   - Never logged
   - Never in version control
   - Rotated regularly

2. **Database Credentials:**
   - Environment variables only
   - Encrypted in Railway
   - Access restricted

3. **External API Tokens:**
   - GitHub tokens
   - JIRA tokens
   - Firebase credentials
   - All in environment variables

### Data Storage

1. **Database:**
   - Encrypted at rest (Railway)
   - Encrypted in transit (TLS)
   - Regular backups
   - Access controls

2. **Redis:**
   - Temporary data only
   - No sensitive data cached
   - Encrypted connections

3. **Client Storage:**
   - API key in localStorage
   - No sensitive data in cookies
   - Clear on logout

## Network Security

### HTTPS/TLS

**Production:**
- HTTPS only
- TLS 1.2+ required
- Automatic certificate management (Railway)
- HSTS header enforces HTTPS

**Development:**
- HTTP allowed for localhost
- Visual indicator (green header) for dev environment

### Firewall Rules

Railway provides:
- DDoS protection
- Rate limiting at edge
- IP filtering (if needed)
- Private networking between services

## Dependency Security

### Dependency Management

1. **Regular Updates:**
   ```bash
   pnpm update
   ```

2. **Security Audits:**
   ```bash
   pnpm audit
   pnpm audit --fix
   ```

3. **Automated Scanning:**
   - Dependabot alerts (GitHub)
   - Automated PR for security updates
   - Regular review of dependencies

### Known Vulnerabilities

- Monitor GitHub Security Advisories
- Subscribe to security mailing lists
- Review CVE databases
- Patch promptly

## Error Handling

### Secure Error Messages

**Production:**
```typescript
// Generic error message
res.status(500).json({
  success: false,
  error: 'Internal server error'
});
```

**Development:**
```typescript
// Detailed error for debugging
res.status(500).json({
  success: false,
  error: error.message,
  stack: error.stack
});
```

**Logging:**
```typescript
// Log full error details server-side
Logger.error('Error occurred:', {
  error: error.message,
  stack: error.stack,
  request: {
    method: req.method,
    path: req.path,
    ip: req.ip
  }
});
```

## Logging and Monitoring

### Security Logging

Log security-relevant events:
- Failed authentication attempts
- API key validation failures
- Rate limit violations
- Suspicious activity
- Error conditions

**Log Format:**
```typescript
Logger.warn('Failed authentication attempt', {
  ip: req.ip,
  timestamp: new Date().toISOString(),
  userAgent: req.headers['user-agent']
});
```

### Monitoring

- Monitor failed login attempts
- Track API usage patterns
- Alert on anomalies
- Review logs regularly

## Security Best Practices

### Code Review

- Security-focused code reviews
- Check for common vulnerabilities
- Validate input handling
- Review authentication logic

### Testing

- Security testing in CI/CD
- Penetration testing (periodic)
- Vulnerability scanning
- Dependency audits

### Incident Response

1. **Detection:**
   - Monitor logs
   - Alert on anomalies
   - User reports

2. **Response:**
   - Isolate affected systems
   - Investigate root cause
   - Patch vulnerability
   - Notify users if needed

3. **Recovery:**
   - Restore from backups
   - Verify integrity
   - Resume operations

4. **Post-Incident:**
   - Document incident
   - Update procedures
   - Improve defenses

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] Parameterized database queries
- [ ] No sensitive data in logs
- [ ] Error messages don't leak info
- [ ] Dependencies up to date

### Deployment

- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring active

### Ongoing

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log review
- [ ] Incident response plan
- [ ] Security training

## Next Steps

- [Deployment](./deployment.md) - Deployment architecture
- [Development Setup](../development/setup.md) - Local development
- [API Documentation](../api/overview.md) - API security

