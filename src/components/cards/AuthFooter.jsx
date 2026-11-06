// material-ui
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// project imports
import ContainerWrapper from 'components/ContainerWrapper';

// assets
import SendOutlined from '@ant-design/icons/SendOutlined';
import TikTokOutlined from '@ant-design/icons/TikTokOutlined';
import InstagramOutlined from '@ant-design/icons/InstagramOutlined';

const SOCIAL_LINKS = [
  { label: 'Telegram — @friendshipbracelets1', href: 'https://t.me/friendshipbracelets1', icon: <SendOutlined /> },
  { label: 'TikTok — @friendshipbracelet094', href: 'https://www.tiktok.com/@friendshipbracelet094', icon: <TikTokOutlined /> },
  { label: 'Instagram — @friendshipbracelet094', href: 'https://www.instagram.com/friendshipbracelet094/', icon: <InstagramOutlined /> }
];

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  return (
    <ContainerWrapper>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, justifyContent: { xs: 'center', sm: 'space-between' }, alignItems: 'center', textAlign: { xs: 'center', sm: 'inherit' }, py: 2 }}
      >
        <Typography variant="subtitle2" sx={{ color: 'secondary.main' }}>
          &copy; {new Date().getFullYear()} Friendship Bracelets. All rights reserved.
        </Typography>

        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
          {SOCIAL_LINKS.map(({ label, href, icon }) => (
            <Tooltip key={href} title={label}>
              <IconButton
                size="small"
                color="secondary"
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                sx={{ color: 'secondary.main' }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    </ContainerWrapper>
  );
}
