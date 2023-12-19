import React from 'react';
import { DatePicker as DatePicker_mui } from '@mui/x-date-pickers/DatePicker';
import {
  TextField,
  createTheme,
  ThemeProvider,
  Typography,
} from '@mui/material';

const DatePicker = ({ selectedDate, setSelectedDate, limitOrder }) => {
  const customDatePickerTheme = createTheme({
    palette: {
      primary: {
        main: '#03C988',
        contrastText: '#1B1B1B',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            input: {
              color: '#ffffff',
              height: '35px',
              width: limitOrder ? '165px' : '160px',
              padding: '10px 14px 10px 0',
              fontSize: '1rem',
            },
            '& .MuiInputLabel-root': {
              color: '#ffffff',
            },
            '& .MuiInputBase-input': {
              paddingRight: '0px',
              paddingLeft: '10px',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1B1B1B',
              borderRadius: '10px',
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          // positionStart: {
          //   marginRight: "-12px", // Adjust this value to bring the icon closer to the text
          // },
          root: {
            marginLeft: '0px', // Reduces the default margin on the left side of the adornment
            marginRight: '0px', // Optionally, reduces the margin on the right side if needed
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: '#9F9F9F',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={customDatePickerTheme}>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', textAlign: 'left', fontSize: '.85rem' }}
      >
        Deadline
      </Typography>
      <DatePicker_mui
        value={selectedDate}
        onChange={(e) => setSelectedDate('deadline', e.unix())}
        renderInput={(params) => <TextField {...params} />}
      />
    </ThemeProvider>
  );
};

export default DatePicker;
