import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

// Custom styled components
const CustomAccordion = styled(Accordion)(({ theme, expanded }) => ({
  width: 290,
  backgroundColor: '#2B2B2B',
  boxShadow: 'none',
  border: 'none',
  '&:before': {
    display: 'none',
  },
  square: false,
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: 35,
  '&.Mui-expanded': {
    minHeight: 35,
  },
}));

const CustomAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: '#1B1B1B',
  padding: theme.spacing(2),
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
  expanded,
  setExpanded,
  tradeType,
}) {
  return (
    <Box sx={{ height: 285, overflow: 'hidden' }}>
      <CustomAccordion
        isExpanded={expanded}
        expanded={expanded}
        onChange={(event, isExpanded) => setExpanded(isExpanded)}
      >
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
              <SummarizeOutlinedIcon sx={{ color: '#03C988' }} />
            </Grid>

            <Grid item>
              <Typography
                sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Trade Summary
              </Typography>
            </Grid>
          </Grid>
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
                {tradeType === 'buy' ? 'drops' : 'rises'} by {percentChange}%
                over the 5 min moving average.
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
