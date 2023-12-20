import React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
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
  borderBottomLeftRadius: 5,
  borderBottomRightRadius: 5,
}));

export default function AvgPriceDropdown({ prices }) {
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
          <Grid
            container
            spacing={1}
            alignItems='center'
            justifyContent='flex-start'
          >
            <Grid item>
              <AttachMoneyOutlinedIcon sx={{ color: '#03C988' }} />
            </Grid>

            <Grid item>
              <Typography
                sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Prices
              </Typography>
            </Grid>
          </Grid>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div>
                <Typography
                  sx={{
                    color: 'gray',
                    fontSize: '0.75',
                    fontWeight: 'medium',
                    mb: 0,
                  }}
                >
                  Current Price
                </Typography>

                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(prices) && prices.length > 1
                    ? '$' + prices[0].toFixed(2)
                    : 'N/A'}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div>
                <Typography
                  sx={{
                    color: 'gray',
                    fontSize: '0.75',
                    fontWeight: 'medium',
                    mb: 0,
                  }}
                >
                  5 min avg.
                </Typography>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(prices) && prices.length > 0
                    ? '$' + prices[1].toFixed(2)
                    : 'N/A'}
                </Typography>
              </div>
            </Grid>

            {/* <Grid item xs={6}>
              <div>
                <Typography
                  sx={{
                    color: 'gray',
                    fontSize: '0.75',
                    fontWeight: 'medium',
                    mb: 0,
                  }}
                >
                  4 hour avg.
                </Typography>

                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(avgPrices) && avgPrices.length > 2
                    ? avgPrices[2].toFixed(2)
                    : 'N/A'}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div>
                <Typography
                  sx={{
                    color: 'gray',
                    fontSize: '0.75',
                    fontWeight: 'medium',
                    mb: 0,
                  }}
                >
                  24 hour avg.
                </Typography>

                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(avgPrices) && avgPrices.length > 3
                    ? avgPrices[3].toFixed(2)
                    : 'N/A'}
                </Typography>
              </div>
            </Grid> */}
          </Grid>
        </CustomAccordionDetails>
      </CustomAccordion>
    </Box>
  );
}
