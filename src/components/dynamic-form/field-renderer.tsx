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
import { FieldConfig } from './types';
import { ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from 'react-hook-form';

interface FieldRendererProps {
  config: FieldConfig;
  field: ControllerRenderProps<Record<string, unknown>, string>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<Record<string, unknown>>;
}

export default function FieldRenderer({ config, field, fieldState, formState }: FieldRendererProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isError = !!fieldState.error;
  const helperText = fieldState.error?.message;
  const isRequired = !!config.validation?.required;

  // A helper function to cast field.value to an array safely for multiple selections
  const safeArrayValue = Array.isArray(field.value) ? field.value : [];

  if (config.type === 'custom' && config.render) {
    return <>{config.render({ field, fieldState, formState })}</>;
  }

  switch (config.type) {
    case 'radio':
      return (
        <FormControl error={isError} component="fieldset" fullWidth margin="none" required={isRequired}>
          <FormLabel component="legend" required={isRequired}>{config.label}</FormLabel>
          <RadioGroup {...field} row>
            {config.options?.map((opt) => (
              <FormControlLabel 
                key={opt.value} 
                value={opt.value} 
                control={<Radio />} 
                label={opt.label} 
              />
            ))}
          </RadioGroup>
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired}>
          <FormControlLabel
            control={<Checkbox {...field} checked={!!field.value} />}
            label={
              <span>
                {config.label}
                {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
              </span>
            }
          />
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired}>
          <FormControlLabel
            control={<Switch {...field} checked={!!field.value} />}
            label={
              <span>
                {config.label}
                {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
              </span>
            }
          />
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'multi-checkbox':
    case 'multi-switch': {
      const handleMultiChange = (val: string | number, checked: boolean) => {
        const current = safeArrayValue;
        const next = checked ? [...current, val] : current.filter(v => v !== val);
        field.onChange(next);
      };

      return (
        <FormControl error={isError} component="fieldset" fullWidth margin="none" required={isRequired}>
          <FormLabel component="legend" required={isRequired}>{config.label}</FormLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {config.options?.map((opt) => (
              <FormControlLabel 
                key={opt.value} 
                control={
                  config.type === 'multi-switch' ? (
                    <Switch 
                      checked={safeArrayValue.includes(opt.value)}
                      onChange={(e) => handleMultiChange(opt.value, e.target.checked)} 
                    />
                  ) : (
                    <Checkbox 
                      checked={safeArrayValue.includes(opt.value)}
                      onChange={(e) => handleMultiChange(opt.value, e.target.checked)} 
                    />
                  )
                } 
                label={opt.label} 
              />
            ))}
          </Box>
          {isError && <FormHelperText>{helperText}</FormHelperText>}
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
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
              value={selectedOptions}
              onChange={(_, newValues) => {
                field.onChange(newValues.map((v) => (typeof v === 'string' ? v : v.value)));
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  minHeight: 56,
                  boxSizing: 'border-box',
                },
              }}
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

        const selectedOption =
          options.find((opt) => String(opt.value) === String(field.value)) || null;

        return (
          <Autocomplete
            options={options}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
            isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
            value={selectedOption}
            onChange={(_, newValue) => {
              field.onChange(newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : '');
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                height: 56,
                boxSizing: 'border-box',
              },
            }}
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
          required={isRequired}
          label={config.label}
          margin="none"
          error={isError}
          helperText={helperText}
          value={isMultiple ? safeArrayValue : (value || '')}
          SelectProps={{ multiple: isMultiple }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 56 } }}
        >
          {config.options?.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    case 'slider':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired}>
          <Typography gutterBottom>
            {config.label}
            {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
          </Typography>
          <Slider
            {...field}
            value={typeof field.value === 'number' ? field.value : 0}
            valueLabelDisplay="auto"
            min={config.validation?.min || 0}
            max={config.validation?.max || 100}
          />
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'rating':
      return (
        <FormControl error={isError} fullWidth margin="none" required={isRequired}>
          <Typography component="legend">
            {config.label}
            {isRequired && <span style={{ color: '#ba1a1a', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
          </Typography>
          <Rating
            name={field.name}
            value={typeof field.value === 'number' ? field.value : 0}
            onChange={(_, newValue) => field.onChange(newValue)}
          />
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'editor':
    case 'code':
    case 'signature':
    case 'field-array':
    case 'string-list':
      return (
        <FormControl fullWidth margin="none" required={isRequired}>
          <FormLabel required={isRequired}>{config.label}</FormLabel>
          <Alert severity="info" icon={<Create />} sx={{ mt: 1, borderRadius: '10px' }}>
            <strong>{config.type}</strong> field: This advanced component requires a 3rd party library installation (e.g. Rich Text, CodeMirror). 
            Currently rendering as a placeholder.
          </Alert>
        </FormControl>
      );

    case 'upload':
    case 'upload-box':
    case 'images':
    case 'upload-avatar':
      return (
        <FormControl fullWidth margin="none" error={isError} required={isRequired}>
          <FormLabel required={isRequired}>{config.label}</FormLabel>
          <Box sx={{ mt: 1, p: 2, border: '1px dashed #ccc', borderRadius: '10px', textAlign: 'center' }}>
            <IconButton color="primary" component="label">
              <input hidden type="file" multiple={config.type === 'images' || config.type === 'upload-box'} accept={config.accept} />
              {config.type === 'images' ? <ImageIcon fontSize="large" /> : <CloudUpload fontSize="large" />}
            </IconButton>
            <Typography variant="body2" color="textSecondary">
              {config.type === 'upload-box' ? 'Drag and drop files here' : 'Click to select file(s)'}
            </Typography>
          </Box>
          {isError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case 'password':
      return (
        <TextField
          {...field}
          fullWidth
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
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: -1 }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 56 } }}
        />
      );

    default: {
      // NATIVE TEXT / DATES / URL / TEL / NUMBER
      const inputType = config.type === 'text' ? 'text' : config.type; 
      
      return (
        <TextField
          {...field}
          fullWidth
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
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '10px',
              ...(config.minRows ? {} : { height: 56 }) 
            } 
          }}
        />
      );
    }
  }
}
