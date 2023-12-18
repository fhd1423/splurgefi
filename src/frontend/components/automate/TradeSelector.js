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
import LineChart from '../unused/LineChart';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faInfo } from '@fortawesome/free-solid-svg-icons';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '20px',
  height: '20px',
  backgroundColor: '#000000',
  borderRadius: '50%',
  alignSelf: 'center',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',

  '&:hover': {
    transform: 'scale(1.1)',
  },
});

// Custom styles for the form control
const CustomFormControl = styled(FormControl)(({ limitOrder }) => ({
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: limitOrder ? '205px' : '130px',
  height: '55px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'space-between',
  padding: '0 10px',
  position: 'relative',
}));

// Custom styles for the select component
const CustomSelect = styled(Select)({
  '& .MuiSelect-select': {
    color: 'white',
    lineHeight: '80px',
    paddingLeft: '10px',
    paddingRight: '32px',
    fontSize: '1.25rem',
  },
  '& .MuiSelect-icon': {
    display: 'none',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

export default function TradeSelector({
  currentMovAvg,
  onTradeActionChange,
  title,
  tokenAddy,
  limitOrder,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Function to toggle the select dropdown
  const toggleDropdown = () => {
    setSelectOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography
          variant='subtitle1'
          color='white'
          fontWeight='500'
          gutterBottom
          style={{ marginBottom: '3px', fontSize: '.85rem', textAlign: 'left' }}
        >
          {title}
        </Typography>
        <IconContainer
          aria-describedby={id}
          variant='contained'
          onClick={handleClick}
        >
          <InfoOutlinedIcon style={{ color: '#FFFFFF' }} />
        </IconContainer>
      </div>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography
          variant='subtitle1'
          color='black'
          fontWeight='500'
          gutterBottom
          style={{
            marginBottom: '3px',
            fontSize: '1rem',
            textAlign: 'left',
            padding: '5px',
          }}
        >
          Use this
          <a
            href={`https://dexscreener.com/arbitrum/${tokenAddy}`}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              color: '#50d890',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginLeft: '4px',
              marginRight: '4px',
            }}
          >
            link
          </a>
          to visualize the moving average for this token on DEX Screener.
        </Typography>
      </Popover>
      <CustomFormControl fullWidth limitOrder={limitOrder}>
        <CustomSelect
          open={selectOpen}
          value={currentMovAvg}
          onClose={() => setSelectOpen(false)}
          onOpen={() => setSelectOpen(true)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
          onChange={(event) =>
            onTradeActionChange('priceAvg', event.target.value)
          }
        >
          <MenuItem value={15}>15 min</MenuItem>
          <MenuItem value={60}>1 hr</MenuItem>
          <MenuItem value={240}>4 hr</MenuItem>
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
