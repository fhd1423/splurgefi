import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Trade({
  id,
  name,
  complete,
  batches,
  percentChange,
  deadline,
  remainingBatches,
  onStopTrade,
}) {
  const labelStyle = {
    backgroundColor: '#50D890',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const completeStyle = {
    ...labelStyle,
    backgroundColor: 'transparent',
    color: 'green',
  };

  const pendingStyle = {
    ...labelStyle,
    backgroundColor: 'transparent',
  };

  const handleStopTrade = () => {
    onStopTrade(id);
  };

  return (
    <Paper
      style={{
        padding: '16px',
        backgroundColor: '#1B1B1B',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        width: '100%', // Set to 100% to use full width of the parent
        maxWidth: '1090px', // Adjust the max-width to fit your design needs
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      <Grid container justifyContent='space-between' alignItems='center'>
        {/* Left section with labels */}
        <Grid item xs={9} sm={9} md={10} lg={10}>
          <Typography
            variant='h5'
            style={{ fontWeight: 'bold', paddingBottom: '16px' }}
          >
            {name}
          </Typography>
          <Grid container alignItems='center' spacing={1}>
            <Grid item>
              <Typography style={labelStyle}>{batches} Batches</Typography>
            </Grid>
            <Grid item>
              <Typography style={labelStyle}>{percentChange}</Typography>
            </Grid>
            <Grid item>
              <Typography style={labelStyle}>
                {new Date(deadline * 1000).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Button onClick={handleStopTrade}>
            <Typography
              style={{ fontWeight: 'medium', paddingTop: '15px', color: 'red' }}
            >
              Stop Trade
            </Typography>
          </Button>
        </Grid>

        {/* Right section with pending status */}
        <Grid item xs={3} sm={3} md={2} lg={2}>
          {complete ? (
            <Button>
              <Typography style={{ ...completeStyle, textAlign: 'right' }}>
                Complete
              </Typography>
            </Button>
          ) : (
            <Button>
              <Typography style={{ ...pendingStyle, textAlign: 'right' }}>
                {`Pending (${batches - remainingBatches}/${batches})`}
              </Typography>
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
