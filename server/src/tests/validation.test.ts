/**
 * Validation Utility Tests
 * 
 * Tests for validation utility functions including:
 * - ID validation
 * - Required fields validation
 * - JSON validation
 * - String length validation
 * - Email validation
 * - URL validation
 * - Date validation
 * - Boolean validation
 * - Enum validation
 * - Array validation
 * - String sanitization
 */

import {
  validateId,
  validateRequiredFields,
  validateJSON,
  validateStringLength,
  validateEmail,
  validateURL,
  validateDate,
  validateBoolean,
  validateEnum,
  validateArray,
  sanitizeString,
  sanitizeStringPreserveNewlines,
  validateAndSanitizeString,
} from '../utils/validation';
import { ValidationError } from '../errors/AppError';

describe('Validation Utils', () => {
  describe('validateId', () => {
    it('should validate positive integer IDs', () => {
      expect(validateId(1)).toBe(1);
      expect(validateId('42')).toBe(42);
      expect(validateId(100)).toBe(100);
    });

    it('should throw ValidationError for invalid IDs', () => {
      expect(() => validateId(0)).toThrow(ValidationError);
      expect(() => validateId(-1)).toThrow(ValidationError);
      expect(() => validateId('abc')).toThrow(ValidationError);
      expect(() => validateId(1.5)).toThrow(ValidationError);
      expect(() => validateId(null)).toThrow(ValidationError);
      expect(() => validateId(undefined)).toThrow(ValidationError);
    });

    it('should use custom field name in error message', () => {
      expect(() => validateId(0, 'userId')).toThrow('Invalid userId');
    });
  });

  describe('validateRequiredFields', () => {
    it('should pass when all required fields are present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      expect(() => validateRequiredFields(data, ['name', 'email'])).not.toThrow();
    });

    it('should throw ValidationError for missing fields', () => {
      const data = { name: 'John' };
      expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(ValidationError);
    });

    it('should throw ValidationError for null fields', () => {
      const data = { name: 'John', email: null };
      expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty string fields', () => {
      const data = { name: 'John', email: '   ' };
      expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(ValidationError);
    });

    it('should collect multiple validation errors', () => {
      const data = { name: '' };
      try {
        validateRequiredFields(data, ['name', 'email', 'phone']);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.details).toHaveLength(3);
      }
    });
  });

  describe('validateJSON', () => {
    it('should parse valid JSON', () => {
      expect(validateJSON('{"key":"value"}')).toEqual({ key: 'value' });
      expect(validateJSON('[1,2,3]')).toEqual([1, 2, 3]);
      expect(validateJSON('null')).toBeNull();
      expect(validateJSON('true')).toBe(true);
    });

    it('should throw ValidationError for invalid JSON', () => {
      expect(() => validateJSON('invalid')).toThrow(ValidationError);
      expect(() => validateJSON('{key:value}')).toThrow(ValidationError);
      expect(() => validateJSON('')).toThrow(ValidationError);
    });

    it('should use custom field name in error message', () => {
      expect(() => validateJSON('invalid', 'config')).toThrow('Invalid JSON in config');
    });
  });

  describe('validateStringLength', () => {
    it('should pass for strings within length constraints', () => {
      expect(() => validateStringLength('hello', 'name', { min: 3, max: 10 })).not.toThrow();
      expect(() => validateStringLength('hi', 'name', { min: 2 })).not.toThrow();
      expect(() => validateStringLength('test', 'name', { max: 10 })).not.toThrow();
    });

    it('should throw ValidationError for strings too short', () => {
      expect(() => validateStringLength('hi', 'name', { min: 3 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for strings too long', () => {
      expect(() => validateStringLength('hello world', 'name', { max: 5 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for both min and max violations', () => {
      expect(() => validateStringLength('hi', 'name', { min: 5, max: 10 })).toThrow(ValidationError);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow();
      expect(() => validateEmail('user.name@domain.co.uk')).not.toThrow();
      expect(() => validateEmail('user+tag@example.com')).not.toThrow();
    });

    it('should throw ValidationError for invalid email formats', () => {
      expect(() => validateEmail('invalid')).toThrow(ValidationError);
      expect(() => validateEmail('test@')).toThrow(ValidationError);
      expect(() => validateEmail('@example.com')).toThrow(ValidationError);
      expect(() => validateEmail('test @example.com')).toThrow(ValidationError);
    });

    it('should use custom field name in error message', () => {
      expect(() => validateEmail('invalid', 'userEmail')).toThrow('Invalid userEmail format');
    });
  });

  describe('validateURL', () => {
    it('should validate correct URL formats', () => {
      expect(() => validateURL('https://example.com')).not.toThrow();
      expect(() => validateURL('http://localhost:3000')).not.toThrow();
      expect(() => validateURL('https://example.com/path?query=value')).not.toThrow();
    });

    it('should throw ValidationError for invalid URL formats', () => {
      expect(() => validateURL('invalid')).toThrow(ValidationError);
      expect(() => validateURL('not a url')).toThrow(ValidationError);
      expect(() => validateURL('')).toThrow(ValidationError);
    });

    it('should use custom field name in error message', () => {
      expect(() => validateURL('invalid', 'websiteUrl')).toThrow('Invalid websiteUrl format');
    });
  });

  describe('validateDate', () => {
    it('should validate and parse correct date formats', () => {
      const date1 = validateDate('2025-10-08');
      expect(date1).toBeInstanceOf(Date);
      expect(date1.getFullYear()).toBe(2025);

      const date2 = validateDate('2025-10-08T10:30:00Z');
      expect(date2).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for invalid date formats', () => {
      expect(() => validateDate('invalid')).toThrow(ValidationError);
      expect(() => validateDate('2025-13-01')).toThrow(ValidationError);
      expect(() => validateDate('')).toThrow(ValidationError);
    });

    it('should use custom field name in error message', () => {
      expect(() => validateDate('invalid', 'dueDate')).toThrow('Invalid dueDate format');
    });
  });

  describe('validateBoolean', () => {
    it('should validate boolean values', () => {
      expect(validateBoolean(true)).toBe(true);
      expect(validateBoolean(false)).toBe(false);
    });

    it('should convert string "true" and "false"', () => {
      expect(validateBoolean('true')).toBe(true);
      expect(validateBoolean('false')).toBe(false);
    });

    it('should convert numeric 1 and 0', () => {
      expect(validateBoolean(1)).toBe(true);
      expect(validateBoolean(0)).toBe(false);
    });

    it('should throw ValidationError for invalid boolean values', () => {
      expect(() => validateBoolean('yes')).toThrow(ValidationError);
      expect(() => validateBoolean(2)).toThrow(ValidationError);
      expect(() => validateBoolean(null)).toThrow(ValidationError);
      expect(() => validateBoolean(undefined)).toThrow(ValidationError);
    });
  });

  describe('validateEnum', () => {
    const validValues = ['active', 'inactive', 'pending'];

    it('should validate values in enum', () => {
      expect(validateEnum('active', validValues, 'status')).toBe('active');
      expect(validateEnum('pending', validValues, 'status')).toBe('pending');
    });

    it('should throw ValidationError for values not in enum', () => {
      expect(() => validateEnum('invalid', validValues, 'status')).toThrow(ValidationError);
      expect(() => validateEnum('', validValues, 'status')).toThrow(ValidationError);
    });
  });

  describe('validateArray', () => {
    it('should validate arrays', () => {
      expect(validateArray([1, 2, 3], 'items')).toEqual([1, 2, 3]);
      expect(validateArray([], 'items')).toEqual([]);
    });

    it('should validate array with min length', () => {
      expect(validateArray([1, 2], 'items', { min: 2 })).toEqual([1, 2]);
    });

    it('should validate array with max length', () => {
      expect(validateArray([1, 2], 'items', { max: 5 })).toEqual([1, 2]);
    });

    it('should throw ValidationError for non-arrays', () => {
      expect(() => validateArray('not array', 'items')).toThrow(ValidationError);
      expect(() => validateArray(null, 'items')).toThrow(ValidationError);
      expect(() => validateArray(undefined, 'items')).toThrow(ValidationError);
    });

    it('should throw ValidationError for arrays too short', () => {
      expect(() => validateArray([1], 'items', { min: 2 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for arrays too long', () => {
      expect(() => validateArray([1, 2, 3], 'items', { max: 2 })).toThrow(ValidationError);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>hello')).toBe('hello');
      expect(sanitizeString('<b>bold</b> text')).toBe('bold text');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should replace multiple spaces with single space', () => {
      expect(sanitizeString('hello    world')).toBe('hello world');
    });

    it('should remove newlines', () => {
      expect(sanitizeString('hello\nworld')).toBe('hello world');
      expect(sanitizeString('hello\r\nworld')).toBe('hello world');
    });
  });

  describe('sanitizeStringPreserveNewlines', () => {
    it('should preserve newlines', () => {
      expect(sanitizeStringPreserveNewlines('hello\nworld')).toBe('hello\nworld');
    });

    it('should remove HTML tags but preserve newlines', () => {
      expect(sanitizeStringPreserveNewlines('<b>hello</b>\nworld')).toBe('hello\nworld');
    });
  });

  describe('validateAndSanitizeString', () => {
    it('should validate and sanitize strings', () => {
      expect(validateAndSanitizeString('  hello  ', 'name')).toBe('hello');
    });

    it('should enforce required constraint', () => {
      expect(() => validateAndSanitizeString('', 'name', { required: true })).toThrow(ValidationError);
      expect(() => validateAndSanitizeString('   ', 'name', { required: true })).toThrow(ValidationError);
    });

    it('should enforce length constraints', () => {
      expect(() => validateAndSanitizeString('hi', 'name', { min: 3 })).toThrow(ValidationError);
      expect(() => validateAndSanitizeString('hello world', 'name', { max: 5 })).toThrow(ValidationError);
    });

    it('should preserve newlines when specified', () => {
      const result = validateAndSanitizeString('hello\nworld', 'text', { preserveNewlines: true });
      expect(result).toBe('hello\nworld');
    });

    it('should allow optional empty strings', () => {
      expect(validateAndSanitizeString('', 'name', { required: false })).toBe('');
    });
  });
});

