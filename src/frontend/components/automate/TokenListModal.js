import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/system';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FileCopyIcon from '@mui/icons-material/FileCopy'; // Import the FileCopy icon
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { Tooltip } from '@mui/material';

// Styling
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#1C1C1C',
  color: 'white',
  borderRadius: '8px',
  width: '418px',
  height: '600px',
  padding: '16px',
  position: 'relative',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  overflow: 'auto',
  '&:focus': {
    outline: 'none',
  },
}));

const SearchBar = styled(InputBase)(({ theme }) => ({
  backgroundColor: '#2B2B2B',
  borderRadius: '12px',
  padding: '12px',
  width: '100%',
  marginBottom: '16px',
  marginTop: '32px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
  '& input::placeholder': {
    color: '#FFFFFF',
  },
  color: 'white',
}));

const TokenList = styled(List)(({ theme }) => ({
  maxHeight: 'calc(80vh - 40px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'gray', // Changed to white
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-track': {
    width: '0',
  },
}));

const TokenListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: '8px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#2B2B2B',
    cursor: 'pointer',
  },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TokenListItemText = styled(ListItemText)(({ theme }) => ({
  color: 'white',
  '& .address': {
    color: '#27ae60', // Green color for the address
    marginLeft: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .logo': {
    marginRight: '8px',
    maxHeight: '48px', // Set the maximum height of the logo
  },
}));

const CloseButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  color: 'white',
  minWidth: 'auto',
  padding: 5,
  paddingBottom: 10,
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

// Function to copy the text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(
    () => {
      console.log('Text copied to clipboard');
    },
    (err) => {
      console.error('Error in copying text: ', err);
    },
  );
};

const CopyIcon = styled(FileCopyIcon)({
  color: 'gray',
  fontSize: '1rem',
  marginLeft: '4px',
});

// FUNCTION
const TokenModal = ({
  open,
  onClose,
  setSelectedToken,
  onSelectChange,
  isInput,
  tokenSetter,
}) => {
  // STATE
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState(tokens);
  const [searchTerm, setSearchTerm] = useState('');

  // HANDLERS
  const handleTokenClick = (selectedToken) => {
    setSelectedToken(selectedToken);
    if (isInput) {
      onSelectChange('inputTokenAddress', selectedToken.address);
      tokenSetter(selectedToken);
    } else {
      onSelectChange('outputTokenAddress', selectedToken.address);
      tokenSetter(selectedToken);
    }
    onClose(); // Close the modal after setting the selected token
  };

  useEffect(() => {
    const isTokenMatch = (token) => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = token.name.toLowerCase().includes(searchTermLower);
      const addressMatch = token.address
        .toLowerCase()
        .includes(searchTermLower);
      return nameMatch || addressMatch;
    };

    // Filter tokens based on the search term
    const filtered = tokens.filter(isTokenMatch);
    setFilteredTokens(filtered);
  }, [searchTerm, tokens]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://tokens.coingecko.com/arbitrum-one/all.json',
        );
        const data = await response.json();
        setTokens(data.tokens || []);
        setFilteredTokens(data.tokens || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <StyledModal open={open} onClose={onClose}>
      <StyledBox>
        <CloseButton onClick={onClose}>
          <CloseIcon sx={{ color: '#9F9F9F' }} />
        </CloseButton>
        <SearchBar
          placeholder='Search token or paste address'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TokenList>
          {filteredTokens.map((token) => (
            <TokenListItem
              key={token.address}
              onClick={() =>
                handleTokenClick({
                  name: token.name,
                  address: token.address,
                  logoURI: token.logoURI,
                  symbol: token.symbol,
                })
              }
            >
              <TokenListItemText
                primary={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {token.logoURI && (
                      <img
                        className='logo'
                        src={token.logoURI}
                        alt={`${token.name} Logo`}
                      />
                    )}
                    <span style={{ marginLeft: '8px' }}>{token.name}</span>
                  </div>
                }
              />
              <Tooltip title='Copy Address' arrow>
                <CopyIcon
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the TokenListItem onClick from firing
                    copyToClipboard(token.address);
                  }}
                />
              </Tooltip>
            </TokenListItem>
          ))}
        </TokenList>
      </StyledBox>
    </StyledModal>
  );
};

export default TokenModal;
