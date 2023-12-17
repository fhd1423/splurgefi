import { styled } from '@mui/system';
import React, { useState, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import TokenModal from './TokenListModal';
import { parseEther } from 'viem';

import { Typography, InputBase, FormControl } from '@mui/material';

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
  fontSize: '1.25rem',
  '& .MuiInputBase-input': {
    padding: '20px 12px',
    flex: 1,
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
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#2B2B2B',
  },
});

const Logo = styled('img')({
  width: '20px',
  marginRight: '8px',
});

const DropdownArrow = styled('span')({
  marginLeft: 'auto',
  transform: 'scale(0.8)',
});

const CustomFormControl = styled(FormControl)({
  flexShrink: 0,
  marginRight: '10px',
});

// FUNCTION
export default function InputToken({
  title,
  onValueChange,
  onSelectChange,
  message,
  currentInput,
  setCurrentInput,
}) {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(currentInput);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleAmountChange = (event) => {
    //Ensure input is numerical
    const newValue = event.target.value.replace(/[^0-9.]/g, '');

    const dotCount = (newValue.match(/\./g) || []).length;
    if (dotCount > 1) return;

    setAmount(newValue);
    onValueChange('amount', String(parseEther(newValue)));
  };

  const handleOpenTokenModal = () => {
    setIsTokenModalOpen(true);
  };

  const handleCloseTokenModal = () => {
    setIsTokenModalOpen(false);
  };

  useEffect(() => {
    if (currentInput) {
      setSelectedToken(currentInput);
    }
  }, [currentInput]);

  return (
    <div>
      <CustomInputContainer>
        <CustomInput
          placeholder='0'
          value={amount}
          onChange={handleAmountChange}
        />
        <CustomFormControl variant='standard'>
          <CustomBlackCapsule onClick={handleOpenTokenModal}>
            <Logo src={selectedToken.logoURI} alt={selectedToken.name} />
            {selectedToken.name.length <= 10
              ? selectedToken.name
              : selectedToken.symbol}
            <DropdownArrow>▼</DropdownArrow>
          </CustomBlackCapsule>
        </CustomFormControl>
      </CustomInputContainer>

      <TokenModal
        open={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        setSelectedToken={setSelectedToken}
        onSelectChange={onSelectChange}
        isInput={true}
        tokenSetter={setCurrentInput}
      />
    </div>
  );
}
