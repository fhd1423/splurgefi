import React from 'react';
import { useState } from 'react';
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

function convertedTime(timeToConvert) {
  var convertedTimeString = '';

  if (timeToConvert === 900) {
    convertedTimeString = '15 min';
  } else {
    var convertedTime = timeToConvert / 3600;
    convertedTimeString = `${convertedTime} hour`;
  }

  return convertedTimeString;
}

export default function TradeSummaryDropdown({
  currentInput,
  currentOutput,
  batches,
  percentChange,
  movingAvg,
  timeBwTrades,
}) {
  const [expanded, setExpanded] = useState(true);
  const handleToggleAccordion = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ height: 285, overflow: 'hidden' }}>
      <CustomAccordion expanded={expanded} onChange={handleToggleAccordion}>
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
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li style={{ color: 'white', marginBottom: '10px' }}>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: '1.25',
                }}
              >
                Trade {currentInput} for {currentOutput} in {batches} batches
                when the price of {currentOutput}{' '}
                {currentInput === 'WETH' ? 'drops' : 'rises'} by {percentChange}
                % over the {convertedTime(60 * movingAvg)} moving average.
              </Typography>
            </li>

            <li style={{ color: 'white', marginBottom: '10px' }}>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: '1.25',
                }}
              >
                Execute each batch with at least a {convertedTime(timeBwTrades)}{' '}
                interval.
              </Typography>
            </li>

            <li style={{ color: 'white', marginBottom: '10px' }}>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: '1.25',
                }}
              >
                End trade when the deadline is reached or when all {batches}{' '}
                batches have been completed.
              </Typography>
            </li>
          </ul>
        </CustomAccordionDetails>
      </CustomAccordion>
    </Box>
  );
}
