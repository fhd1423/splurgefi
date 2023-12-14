import { styled } from '@mui/system';
import React, { useState, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import TokenModal from './TokenListModal';

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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const CustomBlackCapsule = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'black',
  borderRadius: '20px',
  padding: '0 10px',
  height: '40px',
  width: '150px',
  color: 'white',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease', // Add transition for smooth color change
  '&:hover': {
    backgroundColor: '#2B2B2B', // Change this to the desired whitish-grey color
  },
});

const Logo = styled('img')({
  width: '20px',
  marginRight: '8px',
});

const DropdownArrow = styled('span')({
  marginLeft: 'auto',
  transform: 'scale(0.8)', // Adjust the scale factor to make it less tall
});

// const CustomSelect = styled(Select)(({ theme }) => ({
//   color: 'white',
//   backgroundColor: '#27ae60',
//   borderRadius: '20px',
//   height: '30px',
//   width: '140px',
//   '& .MuiSelect-select': {
//     '&[aria-label="placeholder"]': {
//       color: 'white',
//     },
//     paddingRight: '30px',
//     paddingLeft: '12px',
//     display: 'flex',
//   },
//   '& .MuiSelect-icon': {
//     color: 'white',
//   },
//   '& .MuiOutlinedInput-notchedOutline': {
//     border: 'none',
//   },
// }));

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
  marginRight: '10px', // Right margin to keep space inside the container
});

const CustomMenuItem = styled(MenuItem)({
  '&.MuiMenuItem-root': {
    justifyContent: 'flex-end',
  },
});

export default function OutputToken({
  title,
  options,
  onSelectChange,
  message,
  currentOutput,
  setCurrentOutput,
}) {
  //STATE
  const [selectedToken, setSelectedToken] = useState(currentOutput);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  //HANDLERS
  const handleTokenChange = (event) => {
    const newToken = event.target.value;
    setSelectedToken(newToken);
    onSelectChange('outputTokenAddress', newToken); // Send to parent view
  };

  const handleOpenTokenModal = () => {
    setIsTokenModalOpen(true);
  };

  const handleCloseTokenModal = () => {
    setIsTokenModalOpen(false);
  };

  useEffect(() => {
    if (currentOutput) {
      setSelectedToken(currentOutput);
    }
  }, [currentOutput]);

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
          placeholder='Token'
          value={selectedToken.address}
          readOnly
        />
        <CustomFormControl variant='standard'>
          <CustomBlackCapsule onClick={handleOpenTokenModal}>
            <Logo src={selectedToken.logoURI} alt={selectedToken.name} />
            {selectedToken.name.length <= 10 ? selectedToken.name : selectedToken.symbol}
            <DropdownArrow>▼</DropdownArrow>
          </CustomBlackCapsule>
        </CustomFormControl>
      </CustomInputContainer>
      <TokenModal
        open={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        setSelectedToken={setSelectedToken}
        onSelectChange={onSelectChange}
        isInput={false}
        tokenSetter={setCurrentOutput}
      />
    </div>
  );
}
