import React, { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';

// Custom styles for the form control
const CustomFormControl = styled(FormControl)({
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: '130px',
  height: '55px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 10px',
});

// Custom styles for the select component
const CustomSelect = styled(Select)({
  '& .MuiSelect-select': {
    color: 'white',
    lineHeight: '80px', // Center the text vertically
    paddingLeft: '10px', // Give some space from the left side
    paddingRight: '32px', // Make room for the icon
    fontSize: '1.2rem',
  },
  '& .MuiSelect-icon': {
    display: 'none', // Hide the default icon
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

export default function TradeSelector({
  selectedTradeAction,
  onTradeActionChange,
  title,
}) {
  const [open, setOpen] = useState(false);

  // Function to toggle the select dropdown
  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '1rem', textAlign: 'left' }}
      >
        {title}
      </Typography>
      <CustomFormControl fullWidth>
        <CustomSelect
          open={open}
          value={selectedTradeAction}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
        >
          <MenuItem value={15}>15 min</MenuItem>
          <MenuItem value={240}>4 hr</MenuItem>
          <MenuItem value={480}>8 hr</MenuItem>
          <MenuItem value={1440}>24 hr</MenuItem>
        </CustomSelect>
        <IconButton
          onClick={toggleDropdown}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 10,
            transform: 'translateY(-50%)',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </CustomFormControl>
    </Box>
  );
}
