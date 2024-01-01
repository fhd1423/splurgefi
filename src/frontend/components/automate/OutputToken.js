import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import TokenModal from './TokenListModal';

import { FormControl, InputBase, MenuItem, Typography } from '@mui/material';

//STYLING
const CustomInputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  padding: '0 10px',
  margin: 0,
  paddingTop: 0,
  width: '455px',
  height: '90px',
  justifyContent: 'space-between',
});

const CustomInput = styled(InputBase)(({ theme }) => ({
  color: 'white',
  fontSize: '1.25rem',
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
  marginRight: '10px',
});

const CustomMenuItem = styled(MenuItem)({
  '&.MuiMenuItem-root': {
    justifyContent: 'flex-end',
  },
});

export default function OutputToken({
  title,
  onSelectChange,
  onValueChange,
  message,
  currentOutput,
  setCurrentOutput,
  limitOrder,
}) {
  //STATE
  const [amount, setAmount] = useState('');
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

  const handleAmountChange = (event) => {
    //Ensure input is numerical
    const newValue = event.target.value.replace(/[^0-9.]/g, '');

    const dotCount = (newValue.match(/\./g) || []).length;
    if (dotCount > 1) return;

    setAmount(newValue);
    const weiValue = 10 ** currentOutput.decimals;
    onValueChange('amount', String(weiValue * newValue));
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
      <CustomInputContainer>
        {limitOrder ? (
          <CustomInput
            placeholder='0.0'
            value={amount}
            onChange={handleAmountChange}
          />
        ) : (
          <CustomInput
            placeholder='Token'
            value={selectedToken.name}
            readOnly
          />
        )}

        <CustomFormControl variant='standard'>
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
              </>
            )}

            <KeyboardArrowDownOutlinedIcon />
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
