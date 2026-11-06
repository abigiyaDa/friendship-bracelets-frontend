import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

// third-party
import { Controller, useFieldArray, useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import { listCustomers } from 'admin/api/customers';
import { listPickupLocations } from 'admin/api/pickupLocations';
import { listProducts } from 'admin/api/products';
import { createOrder } from 'services/customerApi';
import { formatMoney } from 'admin/utils/format';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const createEmptyItem = () => ({
  product: null,
  quantity: 1,
  color_mode: 'as_in_picture',
  colors: [],
  name_text: '',
  notes: ''
});

const DEFAULT_VALUES = {
  full_name: '',
  phone: '',
  email: '',
  telegram_username: '',
  pickup_location: '',
  customer_note: '',
  items: [createEmptyItem()]
};

const getFirstMessage = (value) => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = getFirstMessage(entry);
      if (message) return message;
    }
    return '';
  }

  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      const message = getFirstMessage(entry);
      if (message) return message;
    }
  }

  return '';
};

const looksLikeHtml = (value) =>
  typeof value === 'string' && /^\s*(?:<!doctype html|<html[\s>])/i.test(value);

const collectMessages = (value, path = '') => {
  if (value === null || value === undefined || value === '') return [];

  if (typeof value === 'string') {
    if (looksLikeHtml(value)) return [];
    return [path ? `${path}: ${value}` : value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectMessages(entry, path));
  }

  if (typeof value === 'object') {
    if (typeof value.detail === 'string') return [value.detail];

    return Object.entries(value).flatMap(([key, entry]) => {
      const label = path ? `${path} → ${key}` : key;
      return collectMessages(entry, label);
    });
  }

  return [];
};

const applyServerErrors = (data, setError) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;

  if (data.customer && typeof data.customer === 'object' && !Array.isArray(data.customer)) {
    ['full_name', 'phone', 'email', 'telegram_username'].forEach((field) => {
      const message = getFirstMessage(data.customer[field]);
      if (message) setError(field, { type: 'server', message });
    });
  }

  ['pickup_location', 'customer_note'].forEach((field) => {
    const message = getFirstMessage(data[field]);
    if (message) setError(field, { type: 'server', message });
  });

  if (Array.isArray(data.items)) {
    data.items.forEach((itemErrors, index) => {
      if (!itemErrors || typeof itemErrors !== 'object' || Array.isArray(itemErrors)) return;

      ['product', 'quantity', 'color_mode', 'colors', 'name_text', 'notes'].forEach((field) => {
        const message = getFirstMessage(itemErrors[field]);
        if (message) setError(`items.${index}.${field}`, { type: 'server', message });
      });
    });
  }
};

const getThumbnail = (product) => {
  const images = product?.images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];
  return primary?.image ?? '';
};

const getCustomerLabel = (customer) =>
  customer ? `${customer.full_name} · ${customer.phone}` : '';

const swatchSx = (hexCode) => ({
  width: 14,
  height: 14,
  borderRadius: '50%',
  bgcolor: hexCode || 'grey.300',
  border: 1,
  borderColor: 'divider',
  flexShrink: 0
});

// ==============================|| ADMIN - CREATE ORDER ||============================== //

export default function OrderCreate() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadKey, setLoadKey] = useState(0);

  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerInput, setCustomerInput] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [serverErrors, setServerErrors] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items = watch('items') ?? [];

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const [locations, productPage] = await Promise.all([
          listPickupLocations(),
          listProducts({ page: 1, pageSize: 100, status: 'true' })
        ]);

        if (!active) return;

        setPickupLocations((locations ?? []).filter((location) => location.is_active));
        setProducts((productPage?.results ?? []).filter((product) => product.is_active !== false));
      } catch (error) {
        if (active) {
          const messages = collectMessages(error?.response?.data);
          setLoadError(messages[0] || 'Could not load products and pickup locations.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [loadKey]);

  // Debounced customer search against the admin customer list.
  useEffect(() => {
    const term = customerQuery.trim();

    if (!term) {
      setCustomerOptions([]);
      setCustomerLoading(false);
      return undefined;
    }

    let active = true;
    setCustomerLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await listCustomers({ page: 1, pageSize: 20, search: term });
        if (active) setCustomerOptions(data?.results ?? []);
      } catch {
        if (active) setCustomerOptions([]);
      } finally {
        if (active) setCustomerLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerQuery]);

  const handleCustomerSelect = (_event, customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(getCustomerLabel(customer));

    if (!customer) return;

    setValue('full_name', customer.full_name ?? '', { shouldValidate: true, shouldDirty: true });
    setValue('phone', customer.phone ?? '', { shouldValidate: true, shouldDirty: true });
    setValue('email', customer.email ?? '', { shouldValidate: true, shouldDirty: true });
    setValue('telegram_username', customer.telegram_username ?? '', {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleProductChange = (index, product) => {
    setValue(`items.${index}.product`, product, { shouldValidate: true, shouldDirty: true });
    setValue(`items.${index}.colors`, [], { shouldDirty: true });
    setValue(`items.${index}.name_text`, '', { shouldDirty: true });

    if (!product?.allows_custom_colors) {
      setValue(`items.${index}.color_mode`, 'as_in_picture', { shouldDirty: true });
    }
  };

  const handleColorModeChange = (index, nextMode) => {
    setValue(`items.${index}.color_mode`, nextMode, { shouldValidate: true, shouldDirty: true });

    if (nextMode !== 'custom') {
      setValue(`items.${index}.colors`, [], { shouldValidate: true, shouldDirty: true });
    }
  };

  const estimatedTotal = items.reduce((sum, item) => {
    const price = Number(item?.product?.price ?? 0);
    const quantity = Number(item?.quantity ?? 0);

    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;

    return sum + price * quantity;
  }, 0);

  const onSubmit = async (values) => {
    setServerErrors([]);

    if (!values.items?.length) {
      setServerErrors(['Add at least one item.']);
      return;
    }

    try {
      const payload = {
        customer: {
          full_name: values.full_name.trim(),
          phone: values.phone.trim(),
          email: values.email?.trim() || '',
          telegram_username: values.telegram_username?.trim() || ''
        },
        pickup_location: values.pickup_location,
        customer_note: values.customer_note?.trim() || '',
        items: values.items.map((item) => ({
          product: item.product.id,
          quantity: Number(item.quantity),
          color_mode: item.color_mode,
          colors: item.color_mode === 'custom' ? (item.colors ?? []).map((color) => color.id) : [],
          name_text: item.name_text?.trim() || '',
          notes: item.notes?.trim() || ''
        }))
      };

      const created = await createOrder(payload);

      if (created?.id) {
        navigate(`/admin/orders/${created.id}`, { state: { message: 'Order created' } });
      } else {
        navigate('/admin/orders', { state: { message: 'Order created' } });
      }
    } catch (error) {
      const data = error?.response?.data;

      if (!error?.response) {
        setServerErrors(['Unable to reach the server. Please try again.']);
      } else if (error.response.status === 404) {
        setServerErrors([
          'Order creation is unavailable: the server returned 404 for POST /api/orders/. The backend needs the public order-create endpoint enabled.'
        ]);
      } else {
        const messages = collectMessages(data);
        setServerErrors(messages.length ? messages : ['Could not create the order.']);
      }

      applyServerErrors(data, setError);
    }
  };

  if (loading) {
    return (
      <MainCard title="New order">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      </MainCard>
    );
  }

  if (loadError) {
    return (
      <MainCard title="New order">
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setLoadKey((key) => key + 1)}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      </MainCard>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack sx={{ gap: 2.5 }}>
        {serverErrors.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle2">Please fix the following:</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {serverErrors.map((message, index) => (
                <li key={`${message}-${index}`}>
                  <Typography variant="body2">{message}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        <MainCard title="Customer">
          <Stack sx={{ gap: 2.5 }}>
            <Autocomplete
              options={customerOptions}
              value={selectedCustomer}
              inputValue={customerInput}
              onChange={handleCustomerSelect}
              onInputChange={(_event, value, reason) => {
                setCustomerInput(value);

                if (reason === 'input' || reason === 'clear') setCustomerQuery(value);
              }}
              loading={customerLoading}
              getOptionLabel={getCustomerLabel}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              filterOptions={(options) => options}
              noOptionsText={customerQuery.trim() ? 'No matching customers.' : 'Type to search customers.'}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                  <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">{option.full_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.phone}
                      {option.email ? ` · ${option.email}` : ''}
                    </Typography>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Find existing customer"
                  placeholder="Search name, phone or email"
                  helperText="Optional. Picking a customer fills the fields below."
                />
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Controller
                name="full_name"
                control={control}
                rules={{
                  required: 'Full name is required.',
                  maxLength: { value: 120, message: 'Full name must be 120 characters or fewer.' }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Full name"
                    required
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'Phone is required.',
                  maxLength: { value: 20, message: 'Phone must be 20 characters or fewer.' }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Phone"
                    required
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  maxLength: { value: 254, message: 'Email must be 254 characters or fewer.' },
                  validate: (value) =>
                    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="telegram_username"
                control={control}
                rules={{
                  maxLength: { value: 64, message: 'Telegram username must be 64 characters or fewer.' }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Telegram username"
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
          </Stack>
        </MainCard>

        <MainCard title="Pickup location">
          <Controller
            name="pickup_location"
            control={control}
            rules={{ required: 'Pickup location is required.' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.pickup_location)}>
                <InputLabel id="order-pickup-location-label">Pickup location</InputLabel>
                <Select
                  {...field}
                  labelId="order-pickup-location-label"
                  label="Pickup location"
                  value={field.value ?? ''}
                >
                  <MenuItem value="" disabled>
                    Select a pickup location
                  </MenuItem>
                  {pickupLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                      {location.area ? ` — ${location.area}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {errors.pickup_location && <FormHelperText error>{errors.pickup_location.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </MainCard>

        <MainCard title="Items">
          <Stack sx={{ gap: 2 }}>
            {fields.map((field, index) => {
              const item = items[index] ?? field;
              const product = item.product;
              const colorMode = item.color_mode;
              const colors = product?.colors ?? [];

              return (
                <Box
                  key={field.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">Item {index + 1}</Typography>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() => remove(index)}
                      disabled={fields.length === 1 || isSubmitting}
                    >
                      <CloseOutlined />
                    </IconButton>
                  </Stack>

                  <Stack sx={{ gap: 2.5 }}>
                    <Controller
                      name={`items.${index}.product`}
                      control={control}
                      rules={{ required: 'Product is required.' }}
                      render={({ field: productField, fieldState }) => (
                        <Autocomplete
                          options={products}
                          value={productField.value ?? null}
                          onChange={(_event, value) => handleProductChange(index, value)}
                          onBlur={productField.onBlur}
                          getOptionLabel={(option) => option?.name ?? ''}
                          isOptionEqualToValue={(option, value) => option.id === value?.id}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            const thumbnail = getThumbnail(option);

                            return (
                              <Box
                                component="li"
                                key={key}
                                {...optionProps}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
                              >
                                {thumbnail ? (
                                  <Box
                                    component="img"
                                    src={thumbnail}
                                    alt=""
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                      border: 1,
                                      borderColor: 'divider',
                                      flexShrink: 0
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 1,
                                      bgcolor: 'grey.100',
                                      flexShrink: 0
                                    }}
                                  />
                                )}

                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" noWrap>
                                    {option.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {formatMoney(option.price)}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Product"
                              required
                              placeholder="Search products"
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message}
                            />
                          )}
                        />
                      )}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                      <TextField
                        label="Quantity"
                        type="number"
                        required
                        fullWidth
                        error={Boolean(errors.items?.[index]?.quantity)}
                        helperText={errors.items?.[index]?.quantity?.message}
                        slotProps={{ htmlInput: { min: 1, max: 32767, step: 1 } }}
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          required: 'Quantity is required.',
                          min: { value: 1, message: 'Quantity must be at least 1.' },
                          max: { value: 32767, message: 'Quantity must be 32767 or less.' },
                          validate: (value) => Number.isInteger(value) || 'Use a whole number.'
                        })}
                      />

                      <Controller
                        name={`items.${index}.color_mode`}
                        control={control}
                        render={({ field: modeField }) => (
                          <Box>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
                              Color mode
                            </Typography>
                            <ToggleButtonGroup
                              exclusive
                              size="small"
                              value={modeField.value}
                              onChange={(_event, nextMode) => {
                                if (nextMode) handleColorModeChange(index, nextMode);
                              }}
                            >
                              <ToggleButton value="as_in_picture">As in picture</ToggleButton>
                              {product?.allows_custom_colors && (
                                <ToggleButton value="custom">Custom colors</ToggleButton>
                              )}
                            </ToggleButtonGroup>
                          </Box>
                        )}
                      />
                    </Box>

                    {product?.allows_custom_colors && colorMode === 'custom' && (
                      <Controller
                        name={`items.${index}.colors`}
                        control={control}
                        rules={{
                          validate: (value) =>
                            (Array.isArray(value) && value.length > 0) || 'Choose at least one color.'
                        }}
                        render={({ field: colorsField, fieldState }) => (
                          <Autocomplete
                            multiple
                            options={colors}
                            value={colorsField.value ?? []}
                            onChange={(_event, value) => colorsField.onChange(value)}
                            onBlur={colorsField.onBlur}
                            getOptionLabel={(option) => option?.name ?? ''}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            renderOption={(props, option) => {
                              const { key, ...optionProps } = props;

                              return (
                                <Box
                                  component="li"
                                  key={key}
                                  {...optionProps}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <Box sx={swatchSx(option.hex_code)} />
                                  {option.name}
                                </Box>
                              );
                            }}
                            renderValue={(value, getItemProps) =>
                              value.map((option, colorIndex) => {
                                const { key, ...itemProps } = getItemProps({ index: colorIndex });

                                return (
                                  <Chip
                                    key={key}
                                    {...itemProps}
                                    size="small"
                                    label={
                                      <Box
                                        component="span"
                                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
                                      >
                                        <Box component="span" sx={swatchSx(option.hex_code)} />
                                        {`${colorIndex + 1}. ${option.name}`}
                                      </Box>
                                    }
                                  />
                                );
                              })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Custom colors"
                                placeholder={colorsField.value?.length ? '' : 'Choose colors in order'}
                                error={Boolean(fieldState.error)}
                                helperText={
                                  fieldState.error?.message || 'Selection order becomes position 1, 2, 3…'
                                }
                              />
                            )}
                          />
                        )}
                      />
                    )}

                    {product?.allows_name_text && (
                      <Controller
                        name={`items.${index}.name_text`}
                        control={control}
                        render={({ field: nameField, fieldState }) => {
                          const maxLength = product.max_name_length || 50;
                          const length = (nameField.value ?? '').length;

                          return (
                            <TextField
                              label="Name on bracelet"
                              fullWidth
                              value={nameField.value ?? ''}
                              onChange={(event) => nameField.onChange(event.target.value)}
                              onBlur={nameField.onBlur}
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message || `${length}/${maxLength} characters`}
                              slotProps={{ htmlInput: { maxLength } }}
                            />
                          );
                        }}
                      />
                    )}

                    <TextField
                      label="Item notes"
                      fullWidth
                      multiline
                      minRows={2}
                      error={Boolean(errors.items?.[index]?.notes)}
                      helperText={errors.items?.[index]?.notes?.message}
                      {...register(`items.${index}.notes`, {
                        maxLength: { value: 500, message: 'Notes must be 500 characters or fewer.' }
                      })}
                    />
                  </Stack>
                </Box>
              );
            })}

            <Box>
              <Button
                variant="outlined"
                startIcon={<PlusOutlined />}
                onClick={() => append(createEmptyItem())}
                disabled={isSubmitting}
              >
                Add item
              </Button>
            </Box>
          </Stack>
        </MainCard>

        <MainCard title="Customer note">
          <TextField
            label="Customer note"
            fullWidth
            multiline
            minRows={3}
            error={Boolean(errors.customer_note)}
            helperText={errors.customer_note?.message}
            {...register('customer_note')}
          />
        </MainCard>

        <MainCard title="Summary">
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="subtitle1">Estimated total</Typography>
            <Typography variant="h5">{formatMoney(estimatedTotal)}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            Estimated. The server calculates the final total and deposit.
          </Typography>
        </MainCard>

        <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'flex-end' }}>
          <Button color="secondary" onClick={() => navigate('/admin/orders')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Create order'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
