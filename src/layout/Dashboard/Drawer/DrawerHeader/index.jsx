import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import Typography from '@mui/material/Typography';

// project imports
import DrawerHeaderStyled from './DrawerHeaderStyled';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: '60px',
        width: 'initial',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: open ? '24px' : 0
      }}
    >
      <Typography
        component={Link}
        to="/admin"
        variant="h5"
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          lineHeight: 1.2,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          fontSize: open ? '1rem' : '0.8rem'
        }}
        aria-label="Friendship Bracelets"
      >
        {open ? 'Friendship Bracelets' : 'FB'}
      </Typography>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
