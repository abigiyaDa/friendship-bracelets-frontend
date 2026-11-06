import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - STAT CARD ||============================== //
// Adapted from the template's AnalyticEcommerce card (percentage chip and
// extra text removed). Optionally renders as a link and highlights the value.

export default function StatCard({ title, count, highlight = false, to }) {
  const card = (
    <MainCard contentSX={{ p: 2.25, height: '100%' }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: highlight ? 'warning.main' : 'inherit' }}>
          {count}
        </Typography>
      </Stack>
    </MainCard>
  );

  if (to) {
    return (
      <Box
        component={RouterLink}
        to={to}
        sx={{
          display: 'block',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
        aria-label={`${title} — view`}
      >
        {card}
      </Box>
    );
  }

  return card;
}

StatCard.propTypes = {
  title: PropTypes.string,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  highlight: PropTypes.bool,
  to: PropTypes.string
};
