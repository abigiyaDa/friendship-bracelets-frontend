import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { Controller, useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import ProductImageManager from 'admin/components/ProductImageManager';
import { listCategories } from 'admin/api/categories';
import { listColors } from 'admin/api/colors';
import { createProduct, getProduct, replaceProductColors, updateProduct } from 'admin/api/products';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const SERVER_ERROR_FIELDS = [
  'name',
  'slug',
  'category',
  'description',
  'price',
  'is_special',
  'allows_custom_colors',
  'allows_name_text',
  'max_name_length',
  'lead_time_days',
  'is_active',
  'color_ids',
  'uploaded_images'
];

const DEFAULT_VALUES = {
  name: '',
  slug: '',
  category: '',
  description: '',
  price: '',
  lead_time_days: '',
  is_special: false,
  allows_custom_colors: true,
  allows_name_text: false,
  is_active: true,
  max_name_length: '',
  color_ids: []
};

const asText = (value) => (Array.isArray(value) ? value.join(' ') : String(value ?? ''));

const getErrorMessage = (error, fallback) => {
  if (!error?.response) {
    return 'Unable to reach the server. Please try again.';
  }

  const data = error.response.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue) && firstValue.length) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
};

// Map DRF field errors onto the matching react-hook-form inputs.
const applyServerErrors = (error, setError) => {
  const data = error?.response?.data;

  if (!data || typeof data !== 'object' || Array.isArray(data)) return;

  SERVER_ERROR_FIELDS.forEach((field) => {
    if (data[field]) {
      setError(field, { type: 'server', message: asText(data[field]) });
    }
  });
};

const buildValues = (product) => ({
  name: product.name ?? '',
  slug: product.slug ?? '',
  category: product.category ?? '',
  description: product.description ?? '',
  price: product.price ?? '',
  lead_time_days: product.lead_time_days ?? '',
  is_special: Boolean(product.is_special),
  allows_custom_colors: Boolean(product.allows_custom_colors),
  allows_name_text: Boolean(product.allows_name_text),
  is_active: Boolean(product.is_active),
  max_name_length: product.max_name_length ?? '',
  color_ids: (product.colors ?? []).map((color) => color.id)
});

const swatchSx = (hexCode) => ({
  width: 14,
  height: 14,
  borderRadius: '50%',
  bgcolor: hexCode || 'grey.300',
  border: 1,
  borderColor: 'divider',
  flexShrink: 0
});

// ==============================|| FORM SWITCH ||============================== //

function FormSwitch({ name, label, control }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />
          }
          label={label}
        />
      )}
    />
  );
}

// ==============================|| ADMIN - PRODUCT FORM ||============================== //

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [retryKey, setRetryKey] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const allowsNameText = watch('allows_name_text');
  const selectedColorIds = watch('color_ids') ?? [];

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const [categoryList, colorList, item] = await Promise.all([
          listCategories(),
          listColors(),
          isEdit ? getProduct(id) : Promise.resolve(null)
        ]);

        if (!active) return;

        setCategories(categoryList);
        setColors(colorList);
        setProduct(item);

        if (item) reset(buildValues(item));
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error, 'Could not load the product.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, isEdit, reset, retryKey]);

  useEffect(() => {
    const previews = imageFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImagePreviews(previews);

    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [imageFiles]);

  // Keep already-assigned unavailable colors in the list when editing.
  const colorOptions = useMemo(
    () => colors.filter((color) => color.is_available || selectedColorIds.includes(color.id)),
    [colors, selectedColorIds]
  );

  const selectedColors = selectedColorIds
    .map((colorId) => colors.find((color) => color.id === colorId))
    .filter(Boolean);

  const refreshProduct = useCallback(async () => {
    if (!isEdit) return;

    const item = await getProduct(id);
    setProduct(item);
  }, [id, isEdit]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) return;

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE);

    if (tooLarge) {
      setImageError(`${tooLarge.name} is too large (max 5 MB).`);
      return;
    }

    setImageError('');
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_file, fileIndex) => fileIndex !== index));
  };

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const colorIds = (values.color_ids ?? []).map(Number);
      const payload = {
        ...values,
        color_ids: colorIds,
        uploaded_images: imageFiles
      };

      if (isEdit) {
        await updateProduct(id, payload);

        // Multipart PATCH cannot send an empty list, so clear colors explicitly.
        if (colorIds.length === 0 && product?.colors?.length) {
          await replaceProductColors(id, []);
        }
      } else {
        await createProduct(payload);
      }

      navigate('/admin/products', {
        state: { message: isEdit ? 'Product updated.' : 'Product created.' }
      });
    } catch (error) {
      applyServerErrors(error, setError);
      setFormError(getErrorMessage(error, 'Could not save the product.'));
    }
  };

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      </MainCard>
    );
  }

  if (loadError) {
    return (
      <MainCard>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setRetryKey((key) => key + 1)}>
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
        {formError && <Alert severity="error">{formError}</Alert>}

        <MainCard title={isEdit ? 'Edit product' : 'Add product'}>
          <Stack sx={{ gap: 2.5 }}>
            <TextField
              label="Name"
              required
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name', {
                required: 'Name is required.',
                maxLength: { value: 150, message: 'Name must be 150 characters or fewer.' }
              })}
            />

            <TextField
              label="Slug"
              fullWidth
              error={Boolean(errors.slug)}
              helperText={errors.slug?.message || 'Optional. Generated from the name when left blank.'}
              {...register('slug', {
                maxLength: { value: 170, message: 'Slug must be 170 characters or fewer.' },
                validate: (value) =>
                  !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase letters, numbers and hyphens.'
              })}
            />

            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required.' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.category)}>
                  <InputLabel id="product-category-label">Category</InputLabel>
                  <Select {...field} labelId="product-category-label" label="Category" value={field.value ?? ''}>
                    <MenuItem value="" disabled>
                      Select a category
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText error>{errors.category.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register('description')}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                label="Price"
                type="number"
                required
                fullWidth
                error={Boolean(errors.price)}
                helperText={errors.price?.message}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                {...register('price', {
                  required: 'Price is required.',
                  validate: (value) => Number(value) > 0 || 'Price must be greater than 0.'
                })}
              />

              <TextField
                label="Lead time (days)"
                type="number"
                fullWidth
                error={Boolean(errors.lead_time_days)}
                helperText={errors.lead_time_days?.message}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                {...register('lead_time_days', {
                  validate: (value) =>
                    value === '' ||
                    (/^\d+$/.test(String(value)) && Number(value) >= 0) ||
                    'Use a whole number of days.'
                })}
              />
            </Box>
          </Stack>
        </MainCard>

        <MainCard title="Options & media">
          <Stack sx={{ gap: 2.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 1 }}>
              <FormSwitch name="is_special" label="Special product" control={control} />
              <FormSwitch name="allows_custom_colors" label="Allows custom colors" control={control} />
              <FormSwitch name="allows_name_text" label="Allows name text" control={control} />
              <FormSwitch name="is_active" label="Active" control={control} />
            </Box>

            {allowsNameText && (
              <TextField
                label="Maximum name length"
                type="number"
                required
                sx={{ maxWidth: 260 }}
                error={Boolean(errors.max_name_length)}
                helperText={errors.max_name_length?.message}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                {...register('max_name_length', {
                  validate: (value) =>
                    (Number.isInteger(Number(value)) && Number(value) > 0) || 'Enter a positive whole number.'
                })}
              />
            )}

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Colors
              </Typography>

              <Controller
                name="color_ids"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={colorOptions}
                    value={selectedColors}
                    onChange={(_event, value) => field.onChange(value.map((option) => option.id))}
                    onBlur={field.onBlur}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
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
                          {!option.is_available && (
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                              (unavailable)
                            </Typography>
                          )}
                        </Box>
                      );
                    }}
                    renderValue={(value, getItemProps) =>
                      value.map((option, index) => {
                        const { key, ...itemProps } = getItemProps({ index });

                        return (
                          <Chip
                            key={key}
                            {...itemProps}
                            size="small"
                            label={
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                <Box component="span" sx={swatchSx(option.hex_code)} />
                                {option.name}
                              </Box>
                            }
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Colors"
                        placeholder={selectedColors.length ? '' : 'Choose colors'}
                        error={Boolean(errors.color_ids)}
                        helperText={errors.color_ids?.message}
                      />
                    )}
                  />
                )}
              />
            </Box>

            {!isEdit && (
              <>
                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Images
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadOutlined />}
                    disabled={isSubmitting}
                  >
                    Add images
                    <input type="file" hidden multiple accept="image/*" onChange={handleFiles} />
                  </Button>

                  {imageError && <FormHelperText error>{imageError}</FormHelperText>}
                  {errors.uploaded_images && <FormHelperText error>{errors.uploaded_images.message}</FormHelperText>}

                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1 }}>
                    PNG, JPG or WebP, max 5 MB each. The first image becomes the primary one.
                  </Typography>

                  {imagePreviews.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={preview.url} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={preview.url}
                            alt={preview.file.name}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              objectFit: 'cover',
                              border: 1,
                              borderColor: 'divider',
                              display: 'block'
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Remove ${preview.file.name}`}
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'background.paper',
                              border: 1,
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'background.paper' }
                            }}
                          >
                            <CloseOutlined style={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </MainCard>

        {isEdit && <ProductImageManager product={product} onRefresh={refreshProduct} />}

        <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'flex-end' }}>
          <Button color="secondary" onClick={() => navigate('/admin/products')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create product'
            )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
