import ImportExportRoundedIcon from '@mui/icons-material/ImportExportRounded';
import { Paper } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import * as React from 'react';

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
    <div>
      <Stack
        direction='column'
        justifyContent='center'
        alignItems='center'
        sx={{ width: 35, height: 35 }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: '50%',
            backgroundColor: '#000000',
            height: 35,
            width: 35,
          }}
        />

        <IconButton
          sx={{ color: 'white', position: 'absolute' }}
          aria-label='icon'
          onClick={handleToggle}
        >
          <ImportExportRoundedIcon />
        </IconButton>
      </Stack>
    </div>
  );
}

ToggleSwap.propTypes = {
  selection: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
};
