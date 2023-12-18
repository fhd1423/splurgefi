import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';

const CustomCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#2B2B2B', // Header background color
  color: 'white', // Text color
  margin: theme.spacing(2), // Margin around the card
  borderRadius: theme.shape.borderRadius, // Rounded corners for the card
  width: 'fit-content',
  maxWidth: '80%',
}));

const SummarySection = styled(CardContent)(({ theme }) => ({
  backgroundColor: '#1B1B1B',
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: `${theme.spacing(0.5)} 0`,
  color: 'white',
  display: 'list-item',
  listStyleType: 'disc',
  marginLeft: theme.spacing(2),
}));

const TradeSummaryView = () => {
  return (
    <Box display='flex' justifyContent='left'>
      <CustomCard elevation={3}>
        <CardContent>
          <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
            Trade Summary
          </Typography>
        </CardContent>
        <SummarySection>
          <List disablePadding>
            <StyledListItem>Trade 69,000 JOE for WETH</StyledListItem>
            <StyledListItem>Execute trade in 3 batches</StyledListItem>
            <StyledListItem>
              Sell every time it pumps 10% above moving average
            </StyledListItem>
          </List>
        </SummarySection>
      </CustomCard>
    </Box>
  );
};

export default TradeSummaryView;
