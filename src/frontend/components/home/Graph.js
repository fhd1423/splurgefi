import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import TradeSummaryView from './TradeSummaryView';

const Graph = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      className='mt-10 mb-44 px-4 sm:px-6 md:px-8'
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
              color: '#50D890',
              mb: 2,
              ml: isMobile ? 1 : 3,
            }}
          >
            The Pumpinator
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            component='h3' // 'h8' is not a valid component. You should use 'h2' - 'h6' or 'p'.
            sx={{
              mt: 1,
              mb: 2,
              ml: isMobile ? 1 : 4,
              fontSize: isMobile ? '1rem' : '2rem', // Adjust the font size as needed
              color: '#9F9F9F', // Setting the color to the specified grey
            }}
          >
            Never miss a pump
          </Typography>

          <div className='pt-5 pl-2'>
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
