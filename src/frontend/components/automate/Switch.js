import { Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/system';

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
