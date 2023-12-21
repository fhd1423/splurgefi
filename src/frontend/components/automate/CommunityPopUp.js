import { Paper, Grid, Box, Link } from '@mui/material';

export default function CommunityPopUp() {
  return (
    <Paper
      sx={{
        backgroundColor: '#03C988',
        elevation: 16,
        square: false,
        width: 100,
        height: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Grid container spacing={3} sx={{ padding: 2 }}>
        <Grid item>
          <Link href='https://discord.gg/NNyFSzX5zh' target='_blank'>
            <Box
              component='img'
              src='/assets/discord-mark-white.svg'
              alt='Discord'
              loading='lazy'
              sx={{
                width: 22,
                height: 22,
                display: 'block',
                borderRadius: '8px',
                margin: 'auto',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          </Link>
        </Grid>
        <Grid item>
          <Link href='https://twitter.com/splurgefinance' target='_blank'>
            <Box
              component='img'
              src='/assets/X.svg'
              alt='X'
              loading='lazy'
              sx={{
                width: 20,
                height: 20,
                display: 'block',
                borderRadius: '8px',
                margin: 'auto',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          </Link>
        </Grid>
      </Grid>
    </Paper>
  );
}
