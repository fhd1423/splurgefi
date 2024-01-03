import { Typography } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/system';

// Entire input container (includes icon and textfield)
const CustomInputContainer = styled('div')(({ limitOrder }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '215px',
  height: '55px',
  position: 'relative',
}));

// Custom styles for textfield component
const CustomInput = styled(InputBase)({
  color: 'white',
  fontSize: '1.25rem',
  '& .MuiInputBase-input': {
    textAlign: 'left',
    padding: '0 10px',
    width: 'calc(100% - 50px)',
    height: '100%',
  },
});

// Typography for the percent symbol
const PercentSymbol = styled(Typography)({
  position: 'absolute', // Position it absolutely within the parent container
  right: 10, // Align to the right
  color: 'white',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
});

export default function InputPercent({
  title,
  placeHolder,
  value,
  onValueChange,
  limitOrder,
}) {
  return (
    <div>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='600'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '0.85rem', textAlign: 'left' }}
      >
        {title}
      </Typography>
      <CustomInputContainer limitOrder={limitOrder}>
        <CustomInput
          placeholder={placeHolder}
          limitOrder={limitOrder}
          value={value}
          onChange={(e) => onValueChange('percentChange', e.target.value)}
        />
        <PercentSymbol>%</PercentSymbol> {/* Percent symbol added here */}
      </CustomInputContainer>
    </div>
  );
}
