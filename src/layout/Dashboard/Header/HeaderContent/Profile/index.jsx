import { useRef, useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import { useAuth } from 'admin/auth/AuthContext';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';

const initialFor = (name) => (name ? String(name).trim().charAt(0).toUpperCase() : 'A');

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const { user, logout } = useAuth();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const username = user?.username || 'Admin';
  const email = user?.email || 'No email on file';

  return (
    <Box sx={{ flexShrink: 0, ml: 'auto' }}>
      <Tooltip title="Profile" disableInteractive>
        <ButtonBase
          sx={(theme) => ({
            p: 0.25,
            borderRadius: 1,
            '&:focus-visible': { outline: `2px solid ${theme.vars.palette.secondary.dark}`, outlineOffset: 2 }
          })}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Avatar sx={{ width: 36, height: 36, fontSize: '1rem', bgcolor: 'primary.main' }}>{initialFor(username)}</Avatar>
        </ButtonBase>
      </Tooltip>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.vars.customShadows.z1, width: 290, minWidth: 240, maxWidth: { xs: 250, md: 290 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, py: 2 }}>
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                      <Avatar sx={{ width: 48, height: 48, fontSize: '1.25rem', bgcolor: 'primary.main' }}>{initialFor(username)}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap>
                          {username}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
                          {email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1.75 }} />

                    <Stack sx={{ gap: 0.75, typography: 'body2' }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Is staff
                        </Typography>
                        <Typography variant="body2">{user?.is_staff ? 'Yes' : 'No'}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Is superuser
                        </Typography>
                        <Typography variant="body2">{user?.is_superuser ? 'Yes' : 'No'}</Typography>
                      </Stack>
                    </Stack>

                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<LogoutOutlined />}
                      onClick={handleLogout}
                      sx={{ mt: 2 }}
                    >
                      Logout
                    </Button>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
