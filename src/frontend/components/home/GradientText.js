import { styled } from '@mui/material/styles';

const GradientText = styled('span')(() => ({
  background: `linear-gradient(to bottom, #03C988, #FFFFFF)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}));

export default GradientText;
