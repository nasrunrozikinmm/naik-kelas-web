'use client';

import React from 'react';
import { useForm, Controller, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { FormConfig } from './types';
import { buildZodSchema } from './schema-builder';
import FieldRenderer from './field-renderer';
import * as z from 'zod';

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  globalError?: string | null;
  submitButtonSx?: SxProps<Theme>;
  extraActions?: React.ReactNode;
  spacing?: number;
}

export default function DynamicForm({
  config,
  onSubmit,
  isLoading = false,
  disabled = false,
  globalError = null,
  submitButtonSx,
  extraActions,
  spacing = 2
}: DynamicFormProps) {
  const schema = buildZodSchema(config);
  type FormData = z.infer<typeof schema>;

  // Build default values
  const defaultValues: Record<string, unknown> = {};
  config.fields.forEach((f) => {
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {globalError}
        </Alert>
      )}

      <Grid container spacing={spacing}>
        {config.fields.map((field) => (
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

      {extraActions && (
        <Box sx={{ mt: 1, mb: 0.5 }}>
          {extraActions}
        </Box>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || disabled}
        sx={{
          py: 1.3,
          mt: extraActions ? 1 : 2,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 700,
          ...submitButtonSx
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : (config.submitLabel || 'Submit')}
      </Button>
    </Box>
  );
}
