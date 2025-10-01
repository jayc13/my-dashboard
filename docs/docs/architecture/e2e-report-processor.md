# E2E Report Processor

The E2E Report Processor is a background service that generates E2E test reports using a Redis-based producer/consumer pattern. It processes messages from a Redis queue and stores aggregated test results in the database.

## Overview

The processor implements an asynchronous job processing system that:
- Listens for report generation requests via Redis pub/sub
- Fetches test data from the Cypress Dashboard API
- Aggregates results by application
- Stores summaries and details in the database
- Handles failures with a dead letter queue

## Architecture

### Components

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Producer      │────────▶│    Redis     │────────▶│   Consumer      │
│  (Publisher)    │         │   Pub/Sub    │         │  (Processor)    │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                    │                          │
                                    │                          │
                                    ▼                          ▼
                            ┌──────────────┐         ┌─────────────────┐
                            │  Work Queue  │         │     MySQL       │
                            │              │         │   Database      │
                            └──────────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ Dead Letter  │
                            │    Queue     │
                            └──────────────┘
```

### Data Flow

1. **Message Publishing**: A producer publishes a message to the `e2e:report:generate` channel
2. **Message Reception**: The processor receives the message via Redis pub/sub
3. **Queue Addition**: Message is added to the `e2e:report:queue` for processing
4. **Processing**: Processor fetches data from Cypress API and generates report
5. **Storage**: Report summary and details are stored in MySQL database
6. **Error Handling**: Failed messages are moved to `e2e:report:failed` dead letter queue

## Database Schema

### e2e_report_summaries

Stores daily summary of E2E test runs across all applications.

```sql
CREATE TABLE e2e_report_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    status ENUM('ready', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    total_runs INT NOT NULL DEFAULT 0,
    passed_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### e2e_report_details

Stores detailed breakdown of test runs per application.

```sql
CREATE TABLE e2e_report_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_summary_id INT NOT NULL,
    app_id INT NOT NULL,
    total_runs INT NOT NULL DEFAULT 0,
    passed_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    last_run_status VARCHAR(50) NOT NULL,
    last_failed_run_at TIMESTAMP NULL DEFAULT NULL,
    last_run_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_summary_id) REFERENCES e2e_report_summaries(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    UNIQUE KEY unique_report_app (report_summary_id, app_id)
);
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Cypress API (required for fetching test data)
CYPRESS_API_KEY=your-cypress-api-key

# MySQL Database (required for storing reports)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=cypress_dashboard
```

### Redis Channels and Queues

- **Channel**: `e2e:report:generate` - Pub/sub channel for report requests
- **Queue**: `e2e:report:queue` - Work queue for processing
- **Retry Queue**: `e2e:report:retry` - Sorted set for scheduled retries with exponential backoff
- **Dead Letter Queue**: `e2e:report:failed` - Failed message storage (after 3 retries)

## Usage

### Starting the Processor

#### Development Mode

```bash
cd server
npm run processor:dev
```

This starts the processor with hot-reload enabled using `ts-node-dev`.

#### Production Mode

```bash
cd server
npm run build
npm run processor
```

This runs the compiled JavaScript version.

### Publishing Report Requests

#### Using the Example Script

```bash
# Generate report for today
npm run publish-report

# Generate report for a specific date
npm run publish-report 2025-10-01
```

#### Programmatically

```typescript
import { publishE2EReportRequest } from './processor/e2e_report.processor';

// Publish a report request
await publishE2EReportRequest('2025-10-01', 'optional-request-id');
```

#### Using Redis CLI

```bash
redis-cli PUBLISH e2e:report:generate '{"date":"2025-10-01","requestId":"test-123"}'
```

## Message Format

### Report Request Message

```typescript
interface E2EReportMessage {
  date: string;        // ISO date string in 'YYYY-MM-DD' format
  requestId?: string;  // Optional request ID for tracking
}
```

Example:
```json
{
  "date": "2025-10-01",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Processing Logic

### Report Generation Steps

1. **Validation**: Check if summary already exists for the date
2. **Summary Creation**: Create or update summary with 'pending' status
3. **Data Fetching**: Fetch test data from Cypress Dashboard API (14-day window)
4. **Data Aggregation**: Group runs by project and calculate statistics
5. **Detail Creation**: Create detail records for each application
6. **Summary Update**: Update summary with aggregated totals and 'ready' status
7. **Error Handling**: On failure:
   - **Retry 1**: Schedule retry in 5 seconds
   - **Retry 2**: Schedule retry in 10 seconds
   - **Retry 3**: Schedule retry in 20 seconds
   - **After 3 retries**: Update status to 'failed' and move to dead letter queue

### Run Status Calculation

A run is considered **passed** if all specs in the run passed. Otherwise, it's **failed**.

```typescript
private getRunStatus(runs: CypressRun[]): string {
  return runs
    .filter((run) => run.status !== 'noTests')
    .every(r => r.status === 'passed') ? 'passed' : 'failed';
}
```

### Success Rate Calculation

```typescript
successRate = totalRuns > 0 ? passedRuns / totalRuns : 0
```

The success rate is stored as a decimal between 0 and 1 (e.g., 0.85 = 85%).

## Monitoring

### Logs

The processor outputs detailed logs for monitoring:

```
[E2E Report Processor] Starting...
[E2E Report Processor] Subscribed to channel: e2e:report:generate
[E2E Report Processor] Started successfully
[E2E Report Processor] Received message: { date: '2025-10-01', requestId: 'abc-123' }
[E2E Report Processor] Added to queue: 2025-10-01
[abc-123] [E2E Report Processor] Generating report for date: 2025-10-01
[abc-123] [E2E Report Processor] Fetched 5 apps data
[abc-123] [E2E Report Processor] Created detail for app 1
[abc-123] [E2E Report Processor] Report generated successfully for 2025-10-01
[abc-123] [E2E Report Processor] Total runs: 50, Passed: 45, Failed: 5, Success rate: 90.00%
```

### Health Checks

Check processor status:

```bash
# Check if Redis is accessible
redis-cli PING

# Check main queue length
redis-cli LLEN e2e:report:queue

# Check retry queue length
redis-cli ZCARD e2e:report:retry

# View pending retries with timestamps
redis-cli ZRANGE e2e:report:retry 0 -1 WITHSCORES

# Check failed messages
redis-cli LLEN e2e:report:failed

# View failed messages
redis-cli LRANGE e2e:report:failed 0 -1
```

### Database Queries

```sql
-- Check recent summaries
SELECT * FROM e2e_report_summaries ORDER BY date DESC LIMIT 10;

-- Check pending reports
SELECT * FROM e2e_report_summaries WHERE status = 'pending';

-- Check failed reports
SELECT * FROM e2e_report_summaries WHERE status = 'failed';

-- Get report with details
SELECT 
  s.*,
  d.app_id,
  d.total_runs as app_total_runs,
  d.success_rate as app_success_rate
FROM e2e_report_summaries s
LEFT JOIN e2e_report_details d ON s.id = d.report_summary_id
WHERE s.date = '2025-10-01';
```

## Error Handling

### Retry Strategy

The processor implements a robust retry mechanism:

**Message Processing Retries:**
- Maximum 3 retry attempts per failed message
- Exponential backoff delays: 5 seconds, 10 seconds, 20 seconds
- Retries are scheduled in a Redis sorted set for precise timing
- Each retry includes the retry count in logs for tracking

**Redis Connection Retries:**
- Maximum 3 retries per connection request
- Exponential backoff (50ms * attempt, max 2000ms)
- Automatic reconnection on connection errors

### Dead Letter Queue

Failed messages (after 3 retry attempts) are stored in the dead letter queue with:
- Original message payload
- Error message and stack trace
- Retry count (will be 3)
- Date from the message
- Timestamp of final failure

Example failed message:
```json
{
  "message": "{\"date\":\"2025-10-01\",\"requestId\":\"abc-123\",\"retryCount\":3}",
  "error": "CYPRESS_API_KEY environment variable is not set",
  "errorStack": "Error: CYPRESS_API_KEY...\n    at E2EReportProcessor...",
  "retryCount": 3,
  "date": "2025-10-01",
  "timestamp": "2025-10-01T10:30:45.000Z"
}
```

### Recovery

To reprocess failed messages:

```bash
# View failed messages
redis-cli LRANGE e2e:report:failed 0 -1

# Republish a failed message
redis-cli PUBLISH e2e:report:generate '{"date":"2025-10-01"}'
```

## Deployment

### Docker Compose Example

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: cypress_dashboard
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  processor:
    build: ./server
    command: npm run processor
    environment:
      REDIS_URL: redis://redis:6379
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_USER: root
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: cypress_dashboard
      CYPRESS_API_KEY: ${CYPRESS_API_KEY}
    depends_on:
      - redis
      - mysql
    restart: unless-stopped

volumes:
  redis-data:
  mysql-data:
```

### Scaling

The processor can be scaled horizontally:

```bash
# Run multiple processor instances
docker-compose up --scale processor=3
```

Each instance will process messages from the shared queue, providing:
- Load distribution
- High availability
- Fault tolerance

## Best Practices

### 1. Idempotency

The processor is designed to be idempotent:
- Existing summaries are updated rather than duplicated
- Details are deleted and recreated for each run
- Unique constraints prevent duplicate entries

### 2. Graceful Shutdown

The processor handles shutdown signals gracefully:
- Completes current processing
- Closes Redis connections
- Closes database connections

### 3. Monitoring

Set up monitoring for:
- Queue length (alert if > 100)
- Dead letter queue length (alert if > 0)
- Processing time (alert if > 5 minutes)
- Failed reports (alert on status = 'failed')

### 4. Scheduling

Use cron or a scheduler to generate daily reports:

```bash
# Crontab example - generate report daily at 9 AM
0 9 * * * cd /path/to/server && npm run publish-report
```

## Troubleshooting

### Processor Won't Start

1. Check Redis connection:
   ```bash
   redis-cli PING
   ```

2. Check MySQL connection:
   ```bash
   mysql -h localhost -u root -p
   ```

3. Verify environment variables are set

### Messages Not Processing

1. Check if processor is running
2. Check queue length: `redis-cli LLEN e2e:report:queue`
3. Check processor logs for errors
4. Verify Cypress API key is valid

### Reports Stuck in Pending

1. Check processor logs for errors
2. Verify apps have `watching = 1` in database
3. Check Cypress API is accessible
4. Manually update status if needed:
   ```sql
   UPDATE e2e_report_summaries SET status = 'failed' WHERE status = 'pending' AND date < CURDATE();
   ```

## API Integration

The generated reports can be accessed via the REST API:

```typescript
// Get summary by date
GET /api/e2e_reports/summary?date=2025-10-01

// Get summary with details
GET /api/e2e_reports/summary/1/details

// Get all summaries
GET /api/e2e_reports/summaries
```

See the [API Documentation](../api/overview.md) for more details.

