import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import PictureOutlined from '@ant-design/icons/PictureOutlined';
import CrownFilled from '@ant-design/icons/CrownFilled';

// project imports
import { useCart } from 'shop/CartContext';
import { gradientButtonSx, INK } from 'shop/theme';
import { formatMoney } from 'admin/utils/format';

// ==============================|| SHOP - PRODUCT CARD ||============================== //

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [snackbar, setSnackbar] = useState(false);

  const image = product.primary_image;
  const colors = product.colors ?? [];

  const quickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      key: '',
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image,
      quantity: 1,
      colorMode: 'as_in_picture',
      colorIds: [],
      colorNames: colors.map((c) => c.name),
      nameText: null,
      notes: ''
    });
    setSnackbar(true);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 44px rgba(43, 23, 35, 0.14)' }
      }}
    >
      <CardActionArea onClick={() => navigate(`/shop/${product.slug}`)} sx={{ flexGrow: 1, alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: 'grey.100' }}>
          {image ? (
            <Box
              component="img"
              src={image}
              alt={product.name}
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform .5s ease',
                '.MuiCardActionArea-root:hover &': { transform: 'scale(1.06)' }
              }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.disabled' }}>
              <PictureOutlined style={{ fontSize: 34 }} />
              <Typography variant="caption">No photo yet</Typography>
            </Box>
          )}

          {product.is_special && (
            <Chip
              icon={<CrownFilled style={{ color: '#7A4A00' }} />}
              label="Special"
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontWeight: 800,
                bgcolor: '#FFD84D',
                color: '#7A4A00',
                border: 'none'
              }}
            />
          )}
        </Box>

        <Stack sx={{ p: 1.75, gap: 0.5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
            {product.category?.name}
          </Typography>
          <Typography sx={{ fontWeight: 700, color: INK, lineHeight: 1.25, minHeight: '2.5em' }} noWrap title={product.name}>
            {product.name}
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: INK }}>{formatMoney(product.price)}</Typography>
            {colors.length > 0 && (
              <Stack direction="row" sx={{ gap: 0.4 }}>
                {colors.slice(0, 5).map((color) => (
                  <Tooltip key={color.id} title={color.name}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: color.hex_code || 'grey.300',
                        border: '1px solid rgba(0,0,0,0.18)'
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardActionArea>

      <Box sx={{ p: 1.5, pt: 0 }}>
        <Button fullWidth variant="contained" disableElevation startIcon={<PlusOutlined />} onClick={quickAdd} sx={gradientButtonSx}>
          Add to cart
        </Button>
      </Box>

      <Snackbar
        open={snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(false)}
        message={`“${product.name}” added to your cart`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <Button size="small" color="inherit" onClick={() => navigate('/cart')} sx={{ fontWeight: 800 }}>
            View cart
          </Button>
        }
      />
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    is_special: PropTypes.bool,
    primary_image: PropTypes.string,
    category: PropTypes.shape({ name: PropTypes.string }),
    colors: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number, name: PropTypes.string, hex_code: PropTypes.string })
    )
  }).isRequired
};
