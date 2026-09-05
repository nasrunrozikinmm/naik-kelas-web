import * as z from 'zod';
import { ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from 'react-hook-form';
import { ReactNode } from 'react';

export type FieldType = 
  // Basic
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  // Selection
  | 'select' | 'radio' | 'multi-select' | 'checkbox' | 'multi-checkbox' | 'switch' | 'multi-switch'
  // Date & Time
  | 'date' | 'time' | 'datetime'
  // Advanced
  | 'slider' | 'rating' | 'code' | 'editor'
  // Media
  | 'images' | 'upload' | 'upload-box' | 'upload-avatar'
  // Relational
  | 'autocomplete' | 'country-select'
  // Array
  | 'field-array' | 'string-list'
  // Custom
  | 'signature' | 'custom';

export interface FieldValidation {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  // Custom zod refinement function if needed
  custom?: (val: unknown) => boolean;
  customMessage?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: unknown;
  disabled?: boolean;
  disable?: boolean;
  validation?: FieldValidation;
  // For select/radio/checkbox options
  options?: { label: string; value: string | number }[];
  // For layout (e.g. grid spans)
  gridProps?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  
  // Specific properties for advanced types
  multiple?: boolean;
  searchable?: boolean;
  accept?: string; // for file uploads
  uploadVariant?: "image" | "document" | "any";
  uploadFolder?: string;
  minRows?: number; // for multiline text
  
  // For 'custom' FieldType
  render?: (props: {
    field: ControllerRenderProps<Record<string, unknown>, string>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<Record<string, unknown>>;
  }) => ReactNode;
}

export interface FormSection {
  id?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  fields: FieldConfig[];
  className?: string;
}

export interface FormConfig {
  fields?: FieldConfig[];
  sections?: FormSection[];
  submitLabel?: string;
  // If provided, generates a custom schema based on Zod object
  customSchema?: z.ZodTypeAny; 
}

export function getAllFormFields(config: FormConfig): FieldConfig[] {
  if (config.fields && config.fields.length > 0) {
    return config.fields;
  }
  if (config.sections && config.sections.length > 0) {
    return config.sections.flatMap((section) => section.fields);
  }
  return [];
}
