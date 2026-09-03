'use client';

import React from 'react';
import { useForm, Controller, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { FormConfig, getAllFormFields } from './types';
import { buildZodSchema } from './schema-builder';
import FieldRenderer from './field-renderer';
import * as z from 'zod';

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, unknown>, event?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  globalError?: string | null;
  submitButtonSx?: SxProps<Theme>;
  extraActions?: React.ReactNode;
  spacing?: number;
  hideSubmitButton?: boolean;
}

export default function DynamicForm({
  config,
  onSubmit,
  isLoading = false,
  disabled = false,
  globalError = null,
  submitButtonSx,
  extraActions,
  spacing = 2,
  hideSubmitButton = false
}: DynamicFormProps) {
  const schema = buildZodSchema(config);
  type FormData = z.infer<typeof schema>;

  // Build default values from all fields (supports both flat fields and sections)
  const allFields = getAllFormFields(config);
  const defaultValues: Record<string, unknown> = {};
  allFields.forEach((f) => {
    if (f.defaultValue !== undefined) {
      defaultValues[f.name] = f.defaultValue;
    } else {
      defaultValues[f.name] = f.type === 'number' ? 0 : '';
    }
  });

  const {
    control,
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<FormData>,
  });

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onSubmit)} 
      noValidate 
      sx={{ 
        width: '100%',
        '& .MuiFormLabel-asterisk': {
          color: '#ba1a1a',
          fontWeight: 700,
          ml: 0.25
        }
      }}
    >
      {globalError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
          {globalError}
        </Alert>
      )}

      {config.sections && config.sections.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {config.sections.map((section, sIdx) => (
            <Box
              key={section.id || sIdx}
              className={`bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4 ${section.className || ''}`}
            >
              {(section.title || section.icon) && (
                <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
              )}
              {section.description && (
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {section.description}
                </p>
              )}
              <Grid container spacing={spacing}>
                {section.fields.map((field) => (
                  <Grid item xs={12} {...(field.gridProps || {})} key={field.name}>
                    <Controller
                      name={field.name}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      control={control as any}
                      render={({ field: controllerField, fieldState, formState }) => (
                        <FieldRenderer 
                          config={field} 
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          field={controllerField as any} 
                          fieldState={fieldState} 
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formState={formState as any} 
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      ) : (
        <Grid container spacing={spacing}>
          {(config.fields || []).map((field) => (
            <Grid item xs={12} {...(field.gridProps || {})} key={field.name}>
              <Controller
                name={field.name}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                render={({ field: controllerField, fieldState, formState }) => (
                  <FieldRenderer 
                    config={field} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    field={controllerField as any} 
                    fieldState={fieldState} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formState={formState as any} 
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {extraActions && (
        <Box sx={{ mt: 3 }}>
          {extraActions}
        </Box>
      )}

      {!hideSubmitButton && (
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || disabled}
          sx={{
            py: 1.2,
            mt: extraActions ? 1 : 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            ...submitButtonSx
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : (config.submitLabel || 'Submit')}
        </Button>
      )}
    </Box>
  );
}
