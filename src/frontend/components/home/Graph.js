import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import TradeSummaryView from './TradeSummaryView';

const Graph = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      className='mt-10 mb-10 sm:mb-44 px-4 sm:px-6 md:px-8'
      style={{
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Grid container spacing={2} alignItems='center' justifyContent='center'>
        <Grid item xs={12} md={6}>
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component='h2'
            sx={{
              fontWeight: 'bold',
              color: '#03C988',
              mb: 2,
              ml: isMobile ? 1 : 3,
              fontSize: isMobile ? '2.5rem' : '3rem',
            }}
          >
            Automate Intents
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            component='h3'
            sx={{
              mt: 1,
              mb: 2,
              ml: isMobile ? 1 : 3,
              fontSize: isMobile ? '1.5rem' : '2rem',
              color: '#9F9F9F',
            }}
          >
            Tell us your goal, we'll make it happen.
          </Typography>

          <div style={{ marginLeft: isMobile ? '-16px' : '7px' }}>
            <TradeSummaryView />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <img
            src='/assets/Graph.png'
            alt='Chart'
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maxWidth: '100%',
              borderRadius: '8px',
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Graph;
