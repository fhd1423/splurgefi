import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  // Adjust the margins if needed to control the spacing between the buttons
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
  // backgroundColor: '#1B1B1B', // Default background color for all buttons
  padding: '6px 12px', // Adjust padding to change the size
  fontSize: '0.875rem', // Adjust font size as needed
  lineHeight: 1.75, // Adjust line height to ensure text is centered vertically
  fontFamily: 'Inter, sans-serif', // Set the font family to Inter
  textTransform: 'capitalize', // Capitalize only the first letter
  fontWeight: 'normal', // Default font weight for non-selected buttons
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white', // Text color for selected button
    backgroundColor: '#1B1B1B', // Background color for selected button remains the same
    fontWeight: 'bold', // Font weight for selected button
  },
  border: 'none', // Remove border for all buttons
  '&:hover': {
    backgroundColor: '#1B1B1B', // Maintain the same color on hover
    color: 'white', // Optionally change the text color on hover for non-selected buttons
  },
}));

export default function ToggleBuySell({ selection, setSelection }) {
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
      aria-label='buy sell toggle'
    >
      <StyledToggleButton value='buy' aria-label='buy'>
        Buy
      </StyledToggleButton>
      <StyledToggleButton value='sell' aria-label='sell'>
        Sell
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}

ToggleBuySell.propTypes = {
  selection: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
};
