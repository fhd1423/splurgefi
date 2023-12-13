import { styled } from '@mui/system';
import React, { useState, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import { parseEther } from 'viem';

import {
  Typography,
  Select,
  MenuItem,
  InputBase,
  FormControl,
} from '@mui/material';

//STYLING
const CustomInputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  padding: '0 10px',
  width: '455px',
  height: '80px',
  justifyContent: 'space-between',
});

const CustomInput = styled(InputBase)(({ theme }) => ({
  color: 'white',
  fontSize: '1.5rem',
  '& .MuiInputBase-input': {
    padding: '20px 12px',
    flex: 1,
  },
}));

const CustomSelect = styled(Select)(({ theme }) => ({
  color: 'white',
  backgroundColor: '#27ae60',
  borderRadius: '20px',
  height: '30px',
  width: '140px',
  '& .MuiSelect-select': {
    '&[aria-label="placeholder"]': {
      color: 'white',
    },
    paddingRight: '30px',
    paddingLeft: '12px',
    display: 'flex',
  },
  '& .MuiSelect-icon': {
    color: 'white',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const CustomFormControl = styled(FormControl)({
  flexShrink: 0,
  '&&&:before': {
    borderBottom: 'none',
  },
  '&&:after': {
    borderBottom: 'none',
  },
  '&& .MuiInput-underline:before': {
    borderBottom: 'none',
  },
  '&& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottom: 'none',
  },
  marginRight: '10px',
});

const CustomMenuItem = styled(MenuItem)({
  '&.MuiMenuItem-root': {
    justifyContent: 'flex-end',
  },
});



//FUNCTION - REAL SHIT
export default function InputToken({
  title,
  options,
  onValueChange,
  onSelectChange,
  message,
}) {
  //STATE - token Amt
  const [amount, setAmount] = useState('');

  //STATE - token symbol
  const [selectedToken, setSelectedToken] = useState('');

  //HANDLERS
  const handleAmountChange = (event) => {
    const newValue = event.target.value;
    setAmount(newValue);
    onValueChange('amount', String(parseEther(newValue))); // put wei value in order to sign
  };

  const handleTokenChange = (event) => {
    const newToken = event.target.value;
    setSelectedToken(newToken);
    onSelectChange('inputTokenAddress', newToken); // Lift up the selected token
  };

  //HELPER - ToggleSwap functionality
  useEffect(() => {
    if (message && message.inputTokenAddress) {
      setSelectedToken(message.inputTokenAddress || '');
    }
  }, [message?.inputTokenAddress]);



  return (
    <div>
      <Typography
        variant='h6'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '1rem' }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        <CustomInput
          placeholder='0'
          value={amount}
          onChange={handleAmountChange}
        />
        <CustomFormControl variant='standard'>
          <CustomSelect
            value={selectedToken}
            onChange={handleTokenChange}
            displayEmpty
            input={<OutlinedInput />}
            renderValue={(value) => {
              if (value === '') {
                return <span aria-label='placeholder'>Select input</span>;
              }
              return (
                options.find((option) => option.value === value)?.label || ''
              );
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              getContentAnchorEl: null,
            }}
          >
            {options.map((option) => (
              <CustomMenuItem key={option.value} value={option.value}>
                {option.label}
              </CustomMenuItem>
            ))}
          </CustomSelect>
        </CustomFormControl>
      </CustomInputContainer>
    </div>
  );
}
