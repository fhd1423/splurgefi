import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import { useState } from 'react';

// Custom styles for the form control
const CustomFormControl = styled(FormControl)({
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: '220px',
  height: '55px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const CustomMenuItem = styled(MenuItem)({
  color: 'white',
  width: '100%',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#E0E0E0',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
  },
});

// Custom styles for the select component
const CustomSelect = styled(Select)({
  '& .MuiSelect-select': {
    color: 'white',
    lineHeight: '50px',
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

export default function TimeSelector({
  selectedTradeAction,
  onTradeActionChange,
  title,
}) {
  const [open, setOpen] = useState(false);

  // Toggles the select dropdown
  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='600'
        gutterBottom
        style={{ marginBottom: '3px', fontSize: '.85rem', textAlign: 'left' }}
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
          onChange={(event) =>
            onTradeActionChange('timeBwTrade', event.target.value)
          }
          MenuProps={{
            PaperProps: {
              style: {
                width: '220px',
                backgroundColor: '#1B1B1B',
                color: 'white',
                borderRadius: '10px',
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          <CustomMenuItem value={900}>15 mins</CustomMenuItem>
          <CustomMenuItem value={3600}>1 hr</CustomMenuItem>
          <CustomMenuItem value={14400}>4 hrs</CustomMenuItem>
          <CustomMenuItem value={57600}>24 hrs</CustomMenuItem>
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
