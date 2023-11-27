import React, { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import LineChart from './LineChart';

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
    lineHeight: '80px',
    paddingLeft: '10px',
    paddingRight: '32px',
    fontSize: '1.2rem',
  },
  '& .MuiSelect-icon': {
    display: 'none',
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  // Function to toggle the select dropdown
  const toggleDropdown = () => {
    setSelectOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '1rem', textAlign: 'left' }}
        aria-owns={popoverOpen ? 'mouse-over-popover' : undefined}
        aria-haspopup='true'
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {title}
      </Typography>
      <Popover
        id='mouse-over-popover'
        sx={{
          pointerEvents: 'none',
          width: '500px',
          height: '500px',
        }}
        open={popoverOpen}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {/* <Typography sx={{ p: 1 }}>I use Popover.</Typography> */}
        <div
          style={{
            width: '500px',
            height: '300px',
          }}
        >
          <LineChart />
        </div>
      </Popover>
      <CustomFormControl fullWidth>
        <CustomSelect
          open={selectOpen}
          value={selectedTradeAction}
          onClose={() => setSelectOpen(false)}
          onOpen={() => setSelectOpen(true)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
          onChange={(event) => onTradeActionChange(event.target.value)}
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
