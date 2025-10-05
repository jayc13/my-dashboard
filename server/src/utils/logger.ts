import winston from 'winston';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Log levels:
 * - error: 0 - Error messages
 * - warn: 1 - Warning messages
 * - info: 2 - Informational messages
 * - http: 3 - HTTP request logs
 * - debug: 4 - Debug messages
 */

// Determine log level based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const configuredLevel = process.env.LOG_LEVEL;

  if (configuredLevel) {
    return configuredLevel;
  }

  // Default log levels per environment
  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    case 'development':
    default:
      return 'debug';
  }
};

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    const metadataKeys = Object.keys(metadata);
    if (metadataKeys.length > 0) {
      // Filter out internal winston properties
      const filteredMetadata = Object.keys(metadata)
        .filter(key => !['timestamp', 'level', 'message', 'stack'].includes(key))
        .reduce((obj, key) => {
          obj[key] = metadata[key];
          return obj;
        }, {} as Record<string, unknown>);
      
      if (Object.keys(filteredMetadata).length > 0) {
        msg += ` ${JSON.stringify(filteredMetadata)}`;
      }
    }
    
    // Add stack trace if present
    if (stack) {
      msg += `\n${stack}`;
    }
    
    return msg;
  })
);

// JSON format for file output
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport - always enabled
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  levels: winston.config.npm.levels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Logger utility with convenience methods
 */
export class Logger {
  /**
   * Log an error message
   */
  static error(message: string, meta?: Record<string, unknown>): void {
    logger.error(message, meta);
  }

  /**
   * Log a warning message
   */
  static warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  }

  /**
   * Log an info message
   */
  static info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  }

  /**
   * Log an HTTP request message
   */
  static http(message: string, meta?: Record<string, unknown>): void {
    logger.http(message, meta);
  }

  /**
   * Log a debug message
   */
  static debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  }

  /**
   * Create a child logger with a specific context
   * Useful for adding consistent metadata to all logs in a module
   */
  static child(defaultMeta: Record<string, unknown>): winston.Logger {
    return logger.child(defaultMeta);
  }

  /**
   * Get the underlying Winston logger instance
   * Use this if you need direct access to Winston features
   */
  static getWinstonLogger(): winston.Logger {
    return logger;
  }
}

// Export the logger as default
export default Logger;

