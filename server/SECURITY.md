# Security Implementation

## Brute Force Protection

This server implements comprehensive brute force protection for the API key validation endpoint to prevent unauthorized access attempts.

### Protection Layers

#### 1. Rate Limiting
- **General Rate Limit**: 10 requests per 15 minutes per IP address
- **Progressive Slowdown**: Adds 1-second delay per request after 3 requests, up to 10 seconds maximum
- **Automatic Reset**: Counters reset after the time window expires

#### 2. Failed Attempt Tracking
- **Attempt Limit**: Maximum 5 failed attempts per IP within 15 minutes
- **Automatic Blocking**: IP addresses are blocked for 30 minutes after 5 failed attempts
- **Memory Cleanup**: Old entries are automatically cleaned up every hour

#### 3. Timing Attack Prevention
- **Constant-Time Comparison**: Uses `crypto.timingSafeEqual()` for API key validation
- **Random Delays**: Adds 50-150ms random delay to prevent timing analysis
- **Buffer Comparison**: Converts strings to buffers for secure comparison

#### 4. Input Validation
- **Type Checking**: Ensures API key is a string
- **Empty Key Detection**: Rejects empty or whitespace-only keys
- **Length Validation**: Prevents timing attacks through length comparison

#### 5. Security Headers
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables XSS filtering
- **Content Security Policy**: Restricts resource loading
- **HSTS**: Enforces HTTPS connections

### Monitoring and Logging

#### Failed Attempt Logging
```
Failed API key validation attempt from IP: [IP_ADDRESS], attempt count: [COUNT]
```

#### Blocked Request Response
```json
{
  "valid": false,
  "error": "Too many failed attempts. Try again in X minutes.",
  "retryAfter": 1800
}
```

### Configuration

#### Environment Variables
- `API_SECURITY_KEY`: The valid API key for authentication

#### Customizable Parameters
- **Max Attempts**: 5 (can be modified in `bruteForceProtection.ts`)
- **Window Duration**: 15 minutes
- **Block Duration**: 30 minutes
- **Rate Limit**: 10 requests per 15 minutes
- **Cleanup Interval**: 1 hour

### Implementation Details

#### Files Modified/Created
1. `middleware/bruteForceProtection.ts` - Main protection logic
2. `controllers/auth.controller.ts` - Enhanced validation with security measures
3. `routes/auth.ts` - Applied middleware to auth routes
4. `index.ts` - Enhanced server security configuration

#### Key Features
- **In-Memory Storage**: Failed attempts stored in memory (consider Redis for production scaling)
- **Automatic Cleanup**: Prevents memory leaks through periodic cleanup
- **IP-Based Tracking**: Uses client IP for attempt tracking
- **Graceful Degradation**: Continues to function even if protection fails

### Production Recommendations

#### For High-Traffic Environments
1. **Use Redis**: Replace in-memory storage with Redis for distributed systems
2. **Database Logging**: Store security events in a database for analysis
3. **Alert System**: Implement alerts for repeated attack attempts
4. **Geolocation Blocking**: Consider blocking requests from suspicious regions

#### Monitoring
1. **Track Failed Attempts**: Monitor patterns in failed authentication attempts
2. **IP Analysis**: Analyze source IPs for potential threats
3. **Response Times**: Monitor for unusual response time patterns
4. **Resource Usage**: Track memory usage of the protection system

### Testing

#### Manual Testing
```bash
# Test rate limiting
for i in {1..15}; do curl -X POST http://localhost:3000/api/auth/validate -H "Content-Type: application/json" -d '{"apiKey":"invalid"}'; done

# Test blocking
for i in {1..6}; do curl -X POST http://localhost:3000/api/auth/validate -H "Content-Type: application/json" -d '{"apiKey":"wrong"}'; done
```

#### Expected Behaviors
1. **First 5 attempts**: Return 401 with increasing delays
2. **6th attempt**: Return 429 with block message
3. **Subsequent attempts**: Continue returning 429 until block expires
4. **Valid key**: Immediately clears failed attempts and returns 200

### Security Considerations

#### Limitations
- **Memory-Based**: Current implementation uses in-memory storage
- **Single Instance**: Not suitable for load-balanced environments without shared storage
- **IP Spoofing**: Vulnerable to IP spoofing attacks (mitigated by proxy trust settings)

#### Mitigations
- **Proxy Trust**: Configured to trust proxy headers for accurate IP detection
- **Multiple Validation Layers**: Combines multiple protection mechanisms
- **Fail-Safe Design**: Continues operation even if individual components fail
