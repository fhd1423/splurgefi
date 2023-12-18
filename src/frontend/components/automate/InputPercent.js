import React from 'react';
import { styled } from '@mui/system';
import InputBase from '@mui/material/InputBase';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Typography } from '@mui/material';

// Entire input container (includes icon and textfield)
const CustomInputContainer = styled('div')(({ limitOrder }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: limitOrder ? '205px' : '130px',
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
    width: 'calc(100% - 50px)', // Reduced width to make room for percent symbol
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
  isUpSelected,
  limitOrder,
}) {
  return (
    <div>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '0.85rem', textAlign: 'left' }}
      >
        {title}
      </Typography>
      <CustomInputContainer limitOrder={limitOrder}>
        {isUpSelected ? (
          <AddIcon
            fontSize='medium'
            style={{ color: 'white', paddingLeft: '10px' }}
          />
        ) : (
          <RemoveIcon
            fontSize='medium'
            style={{ color: 'white', paddingLeft: '10px' }}
          />
        )}
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
