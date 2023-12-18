import * as React from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PropTypes from 'prop-types';

export default function ToggleSwap({
  selection,
  setSelection,
  message,
  handleMessageChange,
  currentInput,
  currentOutput,
  setCurrentInput,
  setCurrentOutput,
}) {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleToggle = () => {
    setIsClicked(true);
    setSelection(selection === 'buy' ? 'sell' : 'buy');
    // Swap pairs data logic
    const inputTokenAddress = message.inputTokenAddress; // Store current input in temp

    handleMessageChange('inputTokenAddress', message.outputTokenAddress);
    handleMessageChange('outputTokenAddress', inputTokenAddress);

    setCurrentInput(currentOutput);
    setCurrentOutput(currentInput);

    setTimeout(() => {
      setIsClicked(false);
    }, 300); // Reset the click state after 300 milliseconds
  };

  return (
    <div
      style={{
        display: 'inline-block',
        borderRadius: '10px',
        border: '2px solid #000',
        padding: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
      }}
      className='bg-green-500 hover:bg-green-600 hover:scale-105'
      onClick={handleToggle}
      aria-label={selection}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <line x1='12' y1='5' x2='12' y2='19'></line>
        <polyline points='19 12 12 19 5 12'></polyline>
      </svg>
    </div>
  );
}

ToggleSwap.propTypes = {
  selection: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
};
