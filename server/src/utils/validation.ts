import { ValidationError } from '../errors/AppError';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorDetail[];
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Validate that a value is a valid integer ID
 */
export function validateId(value: unknown, fieldName: string = 'id'): number {
  const id = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  
  if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError(
      `Invalid ${fieldName}`,
      [{
        field: fieldName,
        message: `${fieldName} must be a positive integer`,
        code: 'INVALID_ID',
        value,
      }],
    );
  }
  
  return id;
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[],
): void {
  const errors: ValidationErrorDetail[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD',
      });
    } else if (typeof value === 'string' && value.trim() === '') {
      errors.push({
        field,
        message: `${field} cannot be empty`,
        code: 'EMPTY_FIELD',
      });
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Missing or invalid required fields', errors);
  }
}

/**
 * Validate that a string is valid JSON
 */
export function validateJSON(value: string, fieldName: string = 'value'): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new ValidationError(
      `Invalid JSON in ${fieldName}`,
      [{
        field: fieldName,
        message: `${fieldName} must be valid JSON`,
        code: 'INVALID_JSON',
        value,
      }],
    );
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  options: { min?: number; max?: number },
): void {
  const errors: ValidationErrorDetail[] = [];
  
  if (options.min !== undefined && value.length < options.min) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${options.min} characters`,
      code: 'STRING_TOO_SHORT',
      value: value.length,
    });
  }
  
  if (options.max !== undefined && value.length > options.max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at most ${options.max} characters`,
      code: 'STRING_TOO_LONG',
      value: value.length,
    });
  }
  
  if (errors.length > 0) {
    throw new ValidationError(`Invalid ${fieldName} length`, errors);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName: string = 'email'): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      [{
        field: fieldName,
        message: `${fieldName} must be a valid email address`,
        code: 'INVALID_EMAIL',
        value: email,
      }],
    );
  }
}

/**
 * Validate URL format
 */
export function validateURL(url: string, fieldName: string = 'url'): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      [{
        field: fieldName,
        message: `${fieldName} must be a valid URL`,
        code: 'INVALID_URL',
        value: url,
      }],
    );
  }
}

/**
 * Validate date format (ISO 8601)
 */
export function validateDate(date: string, fieldName: string = 'date'): Date {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      [{
        field: fieldName,
        message: `${fieldName} must be a valid ISO 8601 date`,
        code: 'INVALID_DATE',
        value: date,
      }],
    );
  }
  
  return parsedDate;
}

/**
 * Validate boolean value
 */
export function validateBoolean(value: unknown, fieldName: string = 'value'): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0') {
      return false;
    }
  }
  
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  
  throw new ValidationError(
    `Invalid ${fieldName} format`,
    [{
      field: fieldName,
      message: `${fieldName} must be a boolean value`,
      code: 'INVALID_BOOLEAN',
      value,
    }],
  );
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: T[],
  fieldName: string = 'value',
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName} value`,
      [{
        field: fieldName,
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        code: 'INVALID_ENUM',
        value,
      }],
    );
  }
  
  return value as T;
}

/**
 * Validate array
 */
export function validateArray(
  value: unknown,
  fieldName: string = 'value',
  options?: { minLength?: number; maxLength?: number },
): unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      [{
        field: fieldName,
        message: `${fieldName} must be an array`,
        code: 'INVALID_ARRAY',
        value,
      }],
    );
  }
  
  const errors: ValidationErrorDetail[] = [];
  
  if (options?.minLength !== undefined && value.length < options.minLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must contain at least ${options.minLength} items`,
      code: 'ARRAY_TOO_SHORT',
      value: value.length,
    });
  }
  
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must contain at most ${options.maxLength} items`,
      code: 'ARRAY_TOO_LONG',
      value: value.length,
    });
  }
  
  if (errors.length > 0) {
    throw new ValidationError(`Invalid ${fieldName} length`, errors);
  }
  
  return value;
}

/**
 * Sanitize string input (trim and remove extra whitespace)
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Validate and sanitize string
 */
export function validateAndSanitizeString(
  value: unknown,
  fieldName: string,
  options?: { min?: number; max?: number; required?: boolean },
): string | undefined {
  if (value === undefined || value === null) {
    if (options?.required) {
      throw new ValidationError(
        `${fieldName} is required`,
        [{
          field: fieldName,
          message: `${fieldName} is required`,
          code: 'REQUIRED_FIELD',
        }],
      );
    }
    return undefined;
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(
      `Invalid ${fieldName} type`,
      [{
        field: fieldName,
        message: `${fieldName} must be a string`,
        code: 'INVALID_TYPE',
        value,
      }],
    );
  }
  
  const sanitized = sanitizeString(value);
  
  if (options?.required && sanitized === '') {
    throw new ValidationError(
      `${fieldName} cannot be empty`,
      [{
        field: fieldName,
        message: `${fieldName} cannot be empty`,
        code: 'EMPTY_FIELD',
      }],
    );
  }
  
  if (options?.min !== undefined || options?.max !== undefined) {
    validateStringLength(sanitized, fieldName, {
      min: options.min,
      max: options.max,
    });
  }
  
  return sanitized || undefined;
}

