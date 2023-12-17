import React from 'react';
import { styled } from '@mui/system';
import InputBase from '@mui/material/InputBase';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Typography } from '@mui/material';

// Entire input container (includes icon and textfield)
const CustomInputContainer = styled('div')(({ limitOrder }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: limitOrder ? '205px' : '130px',
  height: '55px',
}));

// Custom styles for textfield component
const CustomInput = styled(InputBase)({
  color: 'white',
  fontSize: '1.25rem',
  '& .MuiInputBase-input': {
    textAlign: 'left',
    padding: '0 10px',
    width: 'calc(100% - 35px)',
    height: '100%',
  },
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
          <ArrowDropUpIcon fontSize='large' style={{ color: 'white' }} />
        ) : (
          <ArrowDropDownIcon fontSize='large' style={{ color: 'white' }} />
        )}
        <CustomInput
          placeholder={placeHolder}
          limitOrder={limitOrder}
          value={value}
          onChange={(e) => onValueChange('percentChange', e.target.value)}
        />
      </CustomInputContainer>
    </div>
  );
}
