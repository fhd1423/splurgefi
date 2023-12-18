import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// STYLING
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
  color: '#D9D9D9', // Default color for non-selected text
  padding: '6px 12px',
  fontSize: '0.875rem',
  lineHeight: 1.75,
  fontFamily: 'Inter, sans-serif',
  textTransform: 'capitalize',
  fontWeight: 'normal',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: '#1B1B1B',
    fontWeight: 'bold',
  },
  border: 'none',
  '&:hover': {
    backgroundColor: '#1B1B1B',
    color: 'white',
  },
  // Custom styles for the "Pumpinator" button
  '&.Mui-selected.Pumpinator': {
    color: '#27ae60', // Green text color
    transform: 'skewX(-20deg)', // Apply skew transformation
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
  },
}));

// FUNCTION - REAL SHIT
export default function ToggleOrderType({ toggleTrade, setToggleTrade }) {
  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setToggleTrade(newSelection);
    }
  };

  return (
    <StyledToggleButtonGroup
      value={toggleTrade}
      exclusive
      onChange={handleSelection}
      aria-label='pumpinator limit toggle'
    >
      <StyledToggleButton value='pro' aria-label='pro' className={'pro'}>
        Pro
      </StyledToggleButton>
      <StyledToggleButton value='simple' aria-label='simple'>
        Simple
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}

ToggleOrderType.propTypes = {
  selection: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
};
