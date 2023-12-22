import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/system';
import { Typography } from '@mui/material';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        backgroundColor: '#03C988',
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#03C988',
  },
  '& + .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#03C988',
  },
}));

export default function ToggleSwitch({ toggleSwitch }) {
  return (
    <FormControlLabel
      control={
        <MaterialUISwitch
          defaultUnchecked
          size='small'
          onChange={toggleSwitch}
        />
      }
      label={
        <>
          <Typography
            sx={{
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Swap Over Time
          </Typography>
        </>
      }
    />
  );
}
