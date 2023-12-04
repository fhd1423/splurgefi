import React from 'react';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';

// Custom styled components
const CustomAccordion = styled(Accordion)(({ theme }) => ({
  width: 290,
  backgroundColor: '#2B2B2B',
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: 48,
  '&.Mui-expanded': {
    minHeight: 48,
  },
}));

const CustomAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: '#1B1B1B',
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(255, 255, 255, .125)',
  borderBottomLeftRadius: 5,
  borderBottomRightRadius: 5,
}));

export default function TradeSummaryDropdown() {
  return (
    <Box sx={{ height: 285, overflow: 'hidden' }}>
      {' '}
      <CustomAccordion>
        <CustomAccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
            Trade Summary
          </Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
            Trade WETH for LINK in 5 batches when the price of LINK drops by 5%
            over the 4 hour moving average.
          </Typography>
          <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
            Execute each batch with at least a 5 hour interval.
          </Typography>
          <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
            End trade when the deadline is reached or when all 5 batches have
            been completed.
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>
    </Box>
  );
}
