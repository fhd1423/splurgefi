import { styled } from '@mui/system';
import React, { useState, useEffect } from 'react';
import { Typography, InputBase, FormControl } from '@mui/material';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import TokenModal from './TokenListModal';
import { parseEther } from 'viem';

const CustomInputContainer = styled('div')(({ address }) => ({
  display: 'flex',
  flexDirection: 'column', // Stack children vertically
  justifyContent: 'space-between', // Distribute space between items
  alignItems: 'flex-start', // Align items to the start of the container
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  padding: '10px',
  width: '455px',
  height: '90px',
  position: 'relative', // Set to relative
}));

const InputRow = styled('div')({
  display: 'flex',
  flexDirection: 'row', // Align children in a row
  justifyContent: 'space-between', // Space between the input and the capsule
  width: '100%', // Take full width of the container
  alignItems: 'center', // Align items vertically in the center
  paddingRight: '7px',
});

const CustomInput = styled(InputBase)(({ theme }) => ({
  color: 'white',
  fontSize: '1.25rem',
  '& .MuiInputBase-input': {
    padding: '20px 12px',
    flex: 1,
  },
}));

const CustomBlackCapsule = styled('div')(({ address }) => ({
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
}));

const BalanceText = styled(Typography)(({ address }) => ({
  color: '#9F9F9F',
  fontSize: '0.75rem',
  fontWeight: '550',
  position: 'absolute', // Position the balance text absolutely to the bottom right
  bottom: '5px',
  right: '60px',
}));

const Logo = styled('img')({
  width: '20px',
  marginRight: '8px',
});

const DropdownArrow = styled('span')({
  marginLeft: 'auto',
  transform: 'scale(0.8)',
});

const CustomFormControl = styled(FormControl)({
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
  tokenBalance,
  address,
}) {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(currentInput);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleAmountChange = (event) => {
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
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='600'
        gutterBottom
        style={{
          marginBottom: '3px',
          fontSize: '0.85rem',
          textAlign: 'left',
        }}
      >
        {title}
      </Typography>
      <CustomInputContainer address={address}>
        <InputRow>
          <CustomInput
            placeholder='0.0'
            value={amount}
            onChange={handleAmountChange}
          />
          <CustomBlackCapsule onClick={handleOpenTokenModal}>
            {selectedToken.name === 'Unknown Token' ? (
              <>
                <span>{selectedToken.symbol}</span>
              </>
            ) : (
              <>
                <Logo src={selectedToken.logoURI} alt={selectedToken.name} />
                <span>
                  {selectedToken.name.length <= 10
                    ? selectedToken.name
                    : selectedToken.symbol}
                </span>
                <KeyboardArrowDownOutlinedIcon />
              </>
            )}
          </CustomBlackCapsule>
        </InputRow>
        {address && (
          <BalanceText address={address}>Balance: {tokenBalance}</BalanceText>
        )}
      </CustomInputContainer>

      <TokenModal
        open={isTokenModalOpen}
        onClose={handleCloseTokenModal}
        setSelectedToken={setSelectedToken}
        onSelectChange={onSelectChange}
        isInput={true}
        tokenSetter={setCurrentInput}
      />
    </div>
  );
}
