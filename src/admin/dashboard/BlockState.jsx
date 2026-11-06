import PropTypes from 'prop-types';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// ==============================|| DASHBOARD - BLOCK LOADING ||============================== //

export function BlockLoading({ lines = 3, height = 40 }) {
  return (
    <Stack sx={{ gap: 1.5 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={height} />
      ))}
    </Stack>
  );
}

BlockLoading.propTypes = {
  lines: PropTypes.number,
  height: PropTypes.number
};

// ==============================|| DASHBOARD - BLOCK ERROR ||============================== //

export function BlockError({ message, onRetry }) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}

BlockError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};
