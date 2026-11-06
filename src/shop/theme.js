// Shared visual language for the storefront.
export const GRADIENT = 'linear-gradient(135deg, #FF5E8A 0%, #B15CFF 100%)';
export const GRADIENT_SOFT = 'linear-gradient(135deg, rgba(255,94,138,0.12) 0%, rgba(177,92,255,0.12) 100%)';
export const GRADIENT_DEEP = 'linear-gradient(135deg, #2B1733 0%, #3D1F3F 60%, #4B2340 100%)';
export const INK = '#2B1723';
export const PAPER = '#FFFDFB';
export const RADIUS = 16;

export const gradientText = {
  background: GRADIENT,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent'
};

export const gradientButtonSx = {
  background: GRADIENT,
  color: '#fff',
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: 2,
  boxShadow: '0 10px 24px rgba(177, 92, 255, 0.35)',
  '&:hover': { background: GRADIENT, filter: 'brightness(1.06)', boxShadow: '0 12px 28px rgba(177, 92, 255, 0.45)' }
};

// Rainbow "thread" divider — a nod to the stripes in the bracelets.
export const THREAD_STRIP =
  'repeating-linear-gradient(90deg,#FF5E5E 0 14px,#FFB84D 14px 28px,#FFE14D 28px 42px,#4ADE80 42px 56px,#38BDF8 56px 70px,#A78BFA 70px 84px,#F472B6 84px 98px)';


