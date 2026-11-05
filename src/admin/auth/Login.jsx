import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { useAuth } from './AuthContext';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

const BEAD_COLORS = ['#e86a5c', '#f2b544', '#4fb7a8', '#8a6fd1', '#e88bb0', '#e86a5c', '#f2b544', '#4fb7a8'];

const getErrorMessage = (error) => {
  if (!error.response) {
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

  return 'Login failed. Please check your credentials and try again.';
};

// ==============================|| ADMIN LOGIN ||============================== //

export default function AdminLogin() {
  const { isAuthenticated, loading, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#ffffff' }}>
      {/* Left brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          minHeight: '100vh',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: '#0f0f14',
          color: '#ffffff',
          px: { md: 8, lg: 12 },
          py: 8
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontSize: { md: '2.5rem', lg: '3rem' },
            lineHeight: 1.1
          }}
        >
          Friendship Bracelets
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.65)', fontWeight: 400 }}>
          Handmade with love
        </Typography>

        {/* Decorative CSS-only bracelet */}
        <Box sx={{ mt: 10, maxWidth: 420 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { md: 0.75, lg: 1.25 } }}>
            {BEAD_COLORS.map((color, index) => {
              const size = index % 2 === 0 ? { md: 34, lg: 44 } : { md: 28, lg: 36 };

              return (
                <Box
                  key={`${color}-${index}`}
                  sx={{
                    width: size,
                    height: size,
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.55), ${color} 42%, ${color} 100%)`,
                    boxShadow: `inset -4px -5px 10px rgba(0, 0, 0, 0.35), 0 8px 14px rgba(0, 0, 0, 0.3)`,
                    border: '2px solid rgba(255, 255, 255, 0.08)',
                    transform: index % 2 === 0 ? 'translateY(-5px)' : 'translateY(6px)'
                  }}
                />
              );
            })}
          </Box>

          <Box
            sx={{
              height: 46,
              mt: 6,
              borderRadius: 1,
              transform: 'rotate(-4deg)',
              background:
                'repeating-linear-gradient(45deg, #e86a5c 0 10px, #f2b544 10px 20px, #4fb7a8 20px 30px, #8a6fd1 30px 40px, #e88bb0 40px 50px)',
              boxShadow: '0 14px 28px rgba(0, 0, 0, 0.35)',
              opacity: 0.92
            }}
          />
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 6 },
          py: 6
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
          <Typography sx={{ display: { xs: 'block', md: 'none' }, mb: 5, fontWeight: 700, fontSize: '1.35rem', color: '#0f0f14' }}>
            Friendship Bracelets
          </Typography>

          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' }, color: '#0f0f14' }}>
            Admin login
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 4, color: 'text.secondary' }}>
            Friendship Bracelets admin dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack sx={{ gap: 2.5 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="admin-username">Username</InputLabel>
              <OutlinedInput
                id="admin-username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                required
                fullWidth
              />
            </Stack>

            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="admin-password">Password</InputLabel>
              <OutlinedInput
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'hide password' : 'show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Stack>

            <Button type="submit" fullWidth size="large" variant="contained" color="primary" disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Login'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
