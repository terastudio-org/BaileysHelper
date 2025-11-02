import { ValidationResult, ValidationError, ValidationWarning } from './index.js';

/**
 * Custom error class for interactive message validation
 */
export class InteractiveValidationError extends Error {
  name: string = 'InteractiveValidationError';
  context: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  example?: any;
  
  constructor(
    message: string,
    context: string,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = [],
    example?: any
  ) {
    super(message);
    this.context = context;
    this.errors = errors;
    this.warnings = warnings;
    this.example = example;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InteractiveValidationError);
    }
  }

  /**
   * Convert the error to a JSON representation
   */
  toJSON(): ValidationResult {
    return {
      isValid: false,
      errors: this.errors,
      warnings: this.warnings,
      example: this.example
    };
  }

  /**
   * Format detailed validation information
   */
  formatDetailed(): string {
    let output = `${this.name}: ${this.message}\n`;
    output += `Context: ${this.context}\n\n`;

    if (this.errors.length > 0) {
      output += 'Errors:\n';
      this.errors.forEach((error, index) => {
        output += `  ${index + 1}. ${error.path}: ${error.message}\n`;
        if (error.value !== undefined) {
          output += `     Value: ${JSON.stringify(error.value)}\n`;
        }
        if (error.expected !== undefined) {
          output += `     Expected: ${JSON.stringify(error.expected)}\n`;
        }
      });
      output += '\n';
    }

    if (this.warnings.length > 0) {
      output += 'Warnings:\n';
      this.warnings.forEach((warning, index) => {
        output += `  ${index + 1}. ${warning.path}: ${warning.message}\n`;
        if (warning.suggestion) {
          output += `     Suggestion: ${warning.suggestion}\n`;
        }
      });
      output += '\n';
    }

    if (this.example) {
      output += 'Example (correct format):\n';
      output += '```json\n';
      output += JSON.stringify(this.example, null, 2);
      output += '\n```\n';
    }

    return output;
  }

  /**
   * Create a new InteractiveValidationError with additional context
   */
  addContext(context: string): InteractiveValidationError {
    return new InteractiveValidationError(
      `${this.message} in ${context}`,
      `${this.context} -> ${context}`,
      this.errors,
      this.warnings,
      this.example
    );
  }

  /**
   * Static method to create validation errors from common scenarios
   */
  static createButtonValidationError(
    buttonType: string,
    requiredFields: string[],
    providedFields: string[]
  ): InteractiveValidationError {
    const missingFields = requiredFields.filter(field => !providedFields.includes(field));
    
    const errors: ValidationError[] = missingFields.map(field => ({
      path: `button.${field}`,
      message: `Missing required field for ${buttonType} button`,
      expected: field,
      value: undefined
    }));

    const example = {
      type: buttonType,
      id: "button_id",
      title: "Button Title",
      ...requiredFields.reduce((acc, field) => {
        if (field === 'url') acc.url = 'https://example.com';
        if (field === 'phoneNumber') acc.phoneNumber = '+1234567890';
        if (field === 'copyText') acc.copyText = 'Text to copy';
        if (field === 'reminderText') acc.reminderText = 'Reminder message';
        if (field === 'dateTime') acc.dateTime = '2024-01-01T00:00:00Z';
        if (field === 'catalogLink') acc.catalogLink = 'catalog://product/123';
        if (field === 'addressId') acc.addressId = 'address_123';
        if (field === 'options') acc.options = [{ id: 'opt1', title: 'Option 1' }];
        return acc;
      }, {} as any)
    };

    return new InteractiveValidationError(
      `Invalid ${buttonType} button configuration`,
      'button_validation',
      errors,
      [],
      example
    );
  }

  /**
   * Static method to create validation errors for message configuration
   */
  static createConfigValidationError(
    field: string,
    issue: string,
    expected: any,
    actual: any
  ): InteractiveValidationError {
    const errors: ValidationError[] = [{
      path: `config.${field}`,
      message: issue,
      expected,
      value: actual
    }];

    const example = {
      body: "Message body text",
      footer: "Optional footer",
      headerType: 1,
      headerText: "Optional header",
      headerMedia: {
        mediaType: "image",
        mediaUrl: "https://example.com/image.jpg",
        mediaCaption: "Optional caption"
      }
    };

    return new InteractiveValidationError(
      `Invalid message configuration: ${field}`,
      'config_validation',
      errors,
      [],
      example
    );
  }
}