import * as z from 'zod';
import { FormConfig, FieldConfig, getAllFormFields } from './types';

export function buildZodSchema(config: FormConfig) {
  if (config.customSchema) {
    return config.customSchema;
  }

  const schemaShape: Record<string, z.ZodTypeAny> = {};
  const fields = getAllFormFields(config);

  fields.forEach((field: FieldConfig) => {
    let fieldSchema: z.ZodTypeAny;

    const isNumberType = ['number', 'slider', 'rating'].includes(field.type);
    const isBooleanType = ['checkbox', 'switch'].includes(field.type);
    const isArrayType = ['multi-select', 'multi-checkbox', 'multi-switch', 'images', 'field-array', 'string-list', 'upload-box'].includes(field.type) || field.multiple;
    const isCustomType = field.type === 'custom';

    // Base type mapping
    if (isCustomType) {
      fieldSchema = z.any();
    } else if (isNumberType) {
      let numSchema = z.number({
        required_error: field.validation?.requiredMessage || `${field.label} is required`,
        invalid_type_error: `${field.label} must be a number`,
      });

      if (field.validation?.min !== undefined) {
        numSchema = numSchema.min(field.validation.min, {
          message: field.validation.minMessage || `Minimum value is ${field.validation.min}`,
        });
      }

      if (field.validation?.max !== undefined) {
        numSchema = numSchema.max(field.validation.max, {
          message: field.validation.maxMessage || `Maximum value is ${field.validation.max}`,
        });
      }

      if (field.validation?.custom) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        numSchema = (numSchema as any).refine(field.validation.custom, {
          message: field.validation.customMessage || 'Invalid value',
        });
      }

      const isRequired = !!field.validation?.required;
      const targetSchema = isRequired ? numSchema : numSchema.optional();

      // Preprocess values to coerce strings from HTML <input type="number"> into actual numbers
      fieldSchema = z.preprocess((val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? val : num;
      }, targetSchema);
    } else if (isBooleanType) {
      fieldSchema = z.boolean({
        required_error: field.validation?.requiredMessage || `${field.label} is required`,
        invalid_type_error: `${field.label} must be true or false`,
      });
    } else if (isArrayType) {
      fieldSchema = z.array(z.any(), {
        required_error: field.validation?.requiredMessage || `${field.label} is required`,
        invalid_type_error: `${field.label} must be a list`,
      });
    } else {
      // Default to string for text, email, date, select, etc.
      fieldSchema = z.string({
        required_error: field.validation?.requiredMessage || `${field.label} is required`,
        invalid_type_error: `${field.label} must be a string`,
      });

      // Special string formats
      if (field.type === 'email') {
        fieldSchema = (fieldSchema as z.ZodString).email(field.validation?.patternMessage || 'Invalid email address');
      } else if (field.type === 'url') {
        const isUrlRequired = !!field.validation?.required;
        if (isUrlRequired) {
          fieldSchema = (fieldSchema as z.ZodString).url(field.validation?.patternMessage || 'Invalid URL');
        } else {
          fieldSchema = (fieldSchema as z.ZodString).url(field.validation?.patternMessage || 'Invalid URL').optional().or(z.literal(''));
        }
      }
    }

    // Apply validations while schema is still the concrete Zod type (for non-number fields)
    if (field.validation && !isNumberType) {
      const v = field.validation;

      // Required minimum length for strings and arrays
      if (v.required) {
        if (!isBooleanType && !isArrayType && !isCustomType && field.type !== 'url') {
          fieldSchema = (fieldSchema as z.ZodString).min(1, { message: v.requiredMessage || `${field.label} is required` });
        } else if (isArrayType) {
          fieldSchema = (fieldSchema as z.ZodArray<z.ZodTypeAny>).min(1, { message: v.requiredMessage || `At least one ${field.label} is required` });
        }
      }

      // Min/Max for strings and arrays
      if (v.min !== undefined) {
        if (isArrayType) {
          fieldSchema = (fieldSchema as z.ZodArray<z.ZodTypeAny>).min(v.min, { message: v.minMessage || `Minimum items is ${v.min}` });
        } else if (!isBooleanType && !isCustomType) {
          fieldSchema = (fieldSchema as z.ZodString).min(v.min, { message: v.minMessage || `Minimum length is ${v.min}` });
        }
      }

      if (v.max !== undefined) {
        if (isArrayType) {
          fieldSchema = (fieldSchema as z.ZodArray<z.ZodTypeAny>).max(v.max, { message: v.maxMessage || `Maximum items is ${v.max}` });
        } else if (!isBooleanType && !isCustomType) {
          fieldSchema = (fieldSchema as z.ZodString).max(v.max, { message: v.maxMessage || `Maximum length is ${v.max}` });
        }
      }

      // Pattern (regex)
      if (v.pattern && !isBooleanType && !isArrayType && !isCustomType) {
        fieldSchema = (fieldSchema as z.ZodString).regex(v.pattern, { message: v.patternMessage || 'Invalid format' });
      }

      // Custom refinement
      if (v.custom) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fieldSchema = (fieldSchema as any).refine(v.custom, {
          message: v.customMessage || 'Invalid value',
        });
      }

      // If not required, mark as optional at the end of validation chain
      if (!v.required && !isBooleanType && field.type !== 'url') {
        fieldSchema = fieldSchema.optional();
      }
    } else if (!isNumberType) {
      // If no validation provided, make it optional by default (except boolean)
      if (!isBooleanType && field.type !== 'url') {
        fieldSchema = fieldSchema.optional();
      }
    }

    schemaShape[field.name] = fieldSchema;
  });

  return z.object(schemaShape);
}
