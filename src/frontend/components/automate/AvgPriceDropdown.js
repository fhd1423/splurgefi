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
  borderTop: '1px solid rgba(255, 255, 255, .125)',
  borderBottomLeftRadius: 5,
  borderBottomRightRadius: 5,
}));

export default function AvgPriceDropdown({ avgPrices }) {
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
            Avg. Prices
          </Typography>
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
                  15 min avg.
                </Typography>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(avgPrices) && avgPrices.length > 0
                    ? avgPrices[0].toFixed(2)
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
                  1 hour avg.
                </Typography>

                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {Array.isArray(avgPrices) && avgPrices.length > 1
                    ? avgPrices[1].toFixed(2)
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
            </Grid>
          </Grid>
        </CustomAccordionDetails>
      </CustomAccordion>
    </Box>
  );
}
