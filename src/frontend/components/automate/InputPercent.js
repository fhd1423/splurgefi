import React from 'react';
import { styled } from '@mui/system';
import InputBase from '@mui/material/InputBase';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Typography } from '@mui/material';

// Entire input container (includes icon and textfield)
const CustomInputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: '130px',
  height: '55px',
});

// Custom styles for textfield component
const CustomInput = styled(InputBase)({
  color: 'white',
  fontSize: '1.75rem',
  '& .MuiInputBase-input': {
    textAlign: 'center',
    padding: '0 10px',
    width: 'calc(100% - 35px)', // Adjust the width as necessary
    height: '100%',
  },
});

export default function InputPercent({
  title,
  placeHolder,
  value,
  onValueChange,
  isUpSelected, // Boolean variable to determine the icon state
}) {
  return (
    <div>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '1rem', textAlign: 'left' }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        {isUpSelected ? (
          <ArrowDropUpIcon fontSize='large' style={{ color: 'white' }} />
        ) : (
          <ArrowDropDownIcon fontSize='large' style={{ color: 'white' }} />
        )}
        <CustomInput
          placeholder={placeHolder}
          value={value}
          onChange={(e) => onValueChange('percentChange', e.target.value)}
        />
      </CustomInputContainer>
    </div>
  );
}
