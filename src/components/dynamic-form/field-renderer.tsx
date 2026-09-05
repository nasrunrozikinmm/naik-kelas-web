'use client';

import React, { useState } from 'react';
import { 
  TextField, 
  IconButton, 
  InputAdornment, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText, 
  Checkbox, 
  Switch, 
  Slider, 
  Rating, 
  MenuItem, 
  Alert, 
  Typography, 
  Box,
  Autocomplete
} from '@mui/material';
import { Visibility, VisibilityOff, CloudUpload, Image as ImageIcon, Create } from '@mui/icons-material';
import { FileUploader } from '../common/FileUploader';
import { FieldConfig } from './types';
import { ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from 'react-hook-form';

interface FieldRendererProps {
  config: FieldConfig;
  field: ControllerRenderProps<Record<string, unknown>, string>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<Record<string, unknown>>;
}

/**
 * Shared styling for form inputs to give a modern, subtle tinted background
 * that transitions cleanly on hover, focus, and disabled states.
 * Uses a soft, low-contrast tint (rgba(240, 243, 255, 0.35)) so it blends smoothly
 * and subtly against pure white card surfaces without looking stark.
 */
const getOutlinedInputSx = (minRows?: number) => ({
  '& .MuiInputLabel-root': {
    fontSize: '0.8125rem',
    fontWeight: 500,
    '&.MuiInputLabel-shrink': {
      fontSize: '0.75rem',
      fontWeight: 600,
    },
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: 'rgba(240, 243, 255, 0.35)',
    transition: 'all 0.2s ease-in-out',
    boxSizing: 'border-box',
    fontSize: '0.8125rem',
    ...(minRows
      ? { minHeight: Math.max(minRows * 22 + 28, 88) }
      : { height: 50, minHeight: 50 }),
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(195, 197, 215, 0.55)',
      borderWidth: '1px',
      transition: 'border-color 0.2s, border-width 0.2s',
    },
    '&:hover': {
      backgroundColor: 'var(--color-surface-container-lowest, #ffffff)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-primary, #003fb1)',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'var(--color-surface-container-lowest, #ffffff)',
      boxShadow: '0 0 0 3px rgba(0, 63, 177, 0.08)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-primary, #003fb1)',
        borderWidth: '1.5px',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.025)',
      opacity: 0.85,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(195, 197, 215, 0.35)',
      },
    },
    '& input, & .MuiSelect-select': {
      fontSize: '0.8125rem',
      fontWeight: 500,
      py: '13px',
    },
    '& input::placeholder': {
      fontSize: '0.8125rem',
      opacity: 0.75,
    },
    '.dark &': {
      backgroundColor: 'rgba(30, 41, 59, 0.35)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(71, 85, 105, 0.5)',
      },
      '&:hover': {
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
      },
      '&.Mui-disabled': {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      },
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.71875rem',
    mt: 0.5,
  },
});

export default function FieldRenderer({ config, field, fieldState, formState }: FieldRendererProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isError = !!fieldState.error;
  const helperText = fieldState.error?.message;
  const isRequired = !!config.validation?.required;
  const isDisabled = Boolean(config.disabled || config.disable);

  // A helper function to cast field.value to an array safely for multiple selections
  const safeArrayValue = Array.isArray(field.value) ? field.value : [];

  if (config.type === 'custom' && config.render) {
    return <>{config.render({ field, fieldState, formState })}</>;
  }

  switch (config.type) {
    case 'radio':
      return (
        <FormControl error={isError} component="fieldset" fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <FormLabel component="legend" required={isRequired} sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>{config.label}</FormLabel>
          <RadioGroup {...field} row>
            {config.options?.map((opt) => (
              <FormControlLabel 
                key={opt.value} 
                value={opt.value} 
                control={<Radio size="small" />} 
                label={opt.label}
                componentsProps={{ typography: { sx: { fontSize: '0.875rem' } } }}
              />
            ))}
          </RadioGroup>
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <FormControlLabel
            control={<Checkbox size="small" {...field} disabled={isDisabled} checked={!!field.value} />}
            label={
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {config.label}
                {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
              </span>
            }
          />
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <FormControlLabel
            control={<Switch size="small" {...field} disabled={isDisabled} checked={!!field.value} />}
            label={
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {config.label}
                {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
              </span>
            }
          />
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'multi-checkbox':
    case 'multi-switch': {
      const handleMultiChange = (val: string | number, checked: boolean) => {
        const current = safeArrayValue;
        if (isDisabled) return;
        const next = checked ? [...current, val] : current.filter((v) => v !== val);
        field.onChange(next);
      };

      return (
        <FormControl error={isError} component="fieldset" fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <FormLabel component="legend" required={isRequired} sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>{config.label}</FormLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
            {config.options?.map((opt) => (
              <Box
                key={opt.value}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(240, 243, 255, 0.35)',
                  border: '1px solid',
                  borderColor: 'rgba(195, 197, 215, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'var(--color-surface-container-lowest, #ffffff)',
                    borderColor: 'var(--color-primary, #003fb1)',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    config.type === 'multi-switch' ? (
                      <Switch
                        size="small"
                        disabled={isDisabled}
                        checked={safeArrayValue.includes(opt.value)}
                        onChange={(e) => handleMultiChange(opt.value, e.target.checked)}
                      />
                    ) : (
                      <Checkbox
                        size="small"
                        disabled={isDisabled}
                        checked={safeArrayValue.includes(opt.value)}
                        onChange={(e) => handleMultiChange(opt.value, e.target.checked)}
                      />
                    )
                  }
                  label={opt.label}
                  componentsProps={{ typography: { sx: { fontSize: '0.875rem', fontWeight: 500 } } }}
                  sx={{ mr: 0 }}
                />
              </Box>
            ))}
          </Box>
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );
    }

    case 'autocomplete':
    case 'select':
    case 'multi-select':
    case 'country-select': {
      const isMultiple = config.type === 'multi-select' || config.multiple;
      const isSearchable = config.type === 'autocomplete' || config.searchable;
      const options = config.options || [];

      if (isSearchable) {
        if (isMultiple) {
          const selectedOptions = options.filter((opt) =>
            safeArrayValue.map(String).includes(String(opt.value))
          );

          return (
            <Autocomplete
              multiple
              disabled={isDisabled}
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
              value={selectedOptions}
              onChange={(_, newValues) => {
                field.onChange(newValues.map((v) => (typeof v === 'string' ? v : v.value)));
              }}
              sx={{
                ...getOutlinedInputSx(),
                '& .MuiOutlinedInput-root': {
                  ...getOutlinedInputSx()['& .MuiOutlinedInput-root'],
                  height: 'auto',
                  minHeight: 56,
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={config.label}
                  disabled={isDisabled}
                  placeholder={config.placeholder}
                  required={isRequired}
                  error={isError}
                  helperText={helperText}
                  margin="none"
                />
              )}
            />
          );
        }

        const selectedOption =
          options.find((opt) => String(opt.value) === String(field.value)) || null;

        return (
          <Autocomplete
            disabled={isDisabled}
            options={options}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
            isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
            value={selectedOption}
            onChange={(_, newValue) => {
              field.onChange(newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : '');
            }}
            sx={getOutlinedInputSx()}
            renderInput={(params) => (
              <TextField
                {...params}
                label={config.label}
                placeholder={config.placeholder}
                required={isRequired}
                error={isError}
                helperText={helperText}
                margin="none"
              />
            )}
          />
        );
      }

      const { value, ...restField } = field;
      return (
        <TextField
          {...restField}
          select
          fullWidth
          disabled={isDisabled}
          required={isRequired}
          label={config.label}
          margin="none"
          error={isError}
          helperText={helperText}
          value={isMultiple ? safeArrayValue : (value || '')}
          SelectProps={{ multiple: isMultiple }}
          sx={getOutlinedInputSx()}
        >
          {config.options?.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem', py: 1 }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    case 'slider':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <Typography gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {config.label}
            {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
          </Typography>
          <Slider
            {...field}
            disabled={isDisabled}
            value={typeof field.value === 'number' ? field.value : 0}
            valueLabelDisplay="auto"
            min={config.validation?.min || 0}
            max={config.validation?.max || 100}
          />
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'rating':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <Typography component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
            {config.label}
            {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
          </Typography>
          <Rating
            name={field.name}
            disabled={isDisabled}
            value={typeof field.value === 'number' ? field.value : 0}
            onChange={(_, newValue) => field.onChange(newValue)}
          />
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'editor':
    case 'code':
    case 'signature':
    case 'field-array':
    case 'string-list':
      return (
        <FormControl fullWidth margin="none" required={isRequired} disabled={isDisabled}>
          <FormLabel required={isRequired} sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>{config.label}</FormLabel>
          <Alert severity="info" icon={<Create />} sx={{ mt: 1, borderRadius: '10px', fontSize: '0.875rem' }}>
            <strong>{config.type}</strong> field: This advanced component requires a 3rd party library installation (e.g. Rich Text, CodeMirror). 
            Currently rendering as a placeholder.
          </Alert>
        </FormControl>
      );

    case 'upload':
    case 'upload-box':
    case 'upload-avatar': {
      const isObjectVal = typeof field.value === 'object' && field.value !== null;
      const urlValue =
        typeof field.value === 'string'
          ? field.value
          : (field.value as { url?: string })?.url || '';
      const keyValue = isObjectVal ? (field.value as { key?: string })?.key : undefined;

      return (
        <FileUploader
          label={config.label}
          value={urlValue}
          objectKey={keyValue}
          onChange={(url, key) => {
            if (isObjectVal) {
              field.onChange({ url, key });
            } else {
              field.onChange(url);
            }
          }}
          onRemove={() => {
            if (isObjectVal) {
              field.onChange({ url: '', key: '' });
            } else {
              field.onChange('');
            }
          }}
          variant={config.uploadVariant ?? (config.type === 'upload-avatar' ? 'image' : 'image')}
          folder={config.uploadFolder ?? 'uploads'}
          disabled={isDisabled}
          error={helperText}
        />
      );
    }

    case 'images':
      return (
        <FormControl fullWidth margin="none" error={isError} required={isRequired} disabled={isDisabled}>
          <FormLabel required={isRequired} sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>{config.label}</FormLabel>
          <Box
            sx={{
              mt: 1,
              p: 3,
              border: '1.5px dashed',
              borderColor: isError ? 'var(--color-error, #ba1a1a)' : 'rgba(195, 197, 215, 0.55)',
              borderRadius: '10px',
              textAlign: 'center',
              backgroundColor: 'rgba(240, 243, 255, 0.35)',
              transition: 'all 0.2s ease-in-out',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'var(--color-surface-container-lowest, #ffffff)',
                borderColor: 'var(--color-primary, #003fb1)',
              },
            }}
          >
            <IconButton color="primary" component="label" disabled={isDisabled}>
              <input hidden type="file" multiple accept={config.accept} disabled={isDisabled} />
              <ImageIcon fontSize="large" />
            </IconButton>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: '0.8125rem' }}>
              Pilih beberapa gambar
            </Typography>
          </Box>
          {isError && <FormHelperText sx={{ fontSize: '0.75rem' }}>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'password':
      return (
        <TextField
          {...field}
          fullWidth
          disabled={isDisabled}
          required={isRequired}
          label={config.label}
          placeholder={config.placeholder}
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="none"
          error={isError}
          helperText={helperText}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: -1 }} disabled={isDisabled}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={getOutlinedInputSx()}
        />
      );

    default: {
      // NATIVE TEXT / DATES / URL / TEL / NUMBER
      const inputType = config.type === 'text' ? 'text' : config.type; 
      
      return (
        <TextField
          {...field}
          fullWidth
          disabled={isDisabled}
          required={isRequired}
          label={config.label}
          placeholder={config.placeholder}
          type={inputType}
          multiline={!!config.minRows}
          minRows={config.minRows}
          variant="outlined"
          margin="none"
          error={isError}
          helperText={helperText}
          InputLabelProps={
            ['date', 'time', 'datetime', 'datetime-local'].includes(config.type) ? { shrink: true } : undefined
          }
          sx={getOutlinedInputSx(config.minRows)}
        />
      );
    }
  }
}
