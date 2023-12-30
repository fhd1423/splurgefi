import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

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

export default function ProfitDropdown({ profit, tradeType }) {
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
                Profit Estimation
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
                  Profit
                </Typography>

                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {profit}
                </Typography>
              </div>
            </Grid>
          </Grid>
        </CustomAccordionDetails>
      </CustomAccordion>
    </Box>
  );
}
