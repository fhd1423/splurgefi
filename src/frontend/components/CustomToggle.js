import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types'; 

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: '#1B1B1B', // Default button color 
  fontWeight: 'bold', 
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: '#27ae60', // Selected button color 
  },
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
  },
}));

export default function CustomToggle({selection, setSelection}) {

  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setSelection(newSelection);
    }
  };

  return (
    <StyledToggleButtonGroup
      value={selection}
      exclusive
      onChange={handleSelection}
      aria-label="buy sell toggle"
    >
      <StyledToggleButton value="buy" aria-label="buy">
        Buy
      </StyledToggleButton>
      <StyledToggleButton value="sell" aria-label="sell">
        Sell
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );

}

CustomToggle.propTypes = {
    selection: PropTypes.string.isRequired,
    setSelection: PropTypes.func.isRequired,
  };
