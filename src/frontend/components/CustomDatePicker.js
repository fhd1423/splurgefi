import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  TextField,
  createTheme,
  ThemeProvider,
  Typography,
} from '@mui/material';

const customDatePickerTheme = createTheme({
  palette: {
    primary: {
      main: '#50D890',
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
            width: '80px',
            padding: '10px 14px 10px 0',
            fontSize: '1rem', // Adjust the font size as needed
          },
          '& .MuiInputLabel-root': {
            color: '#ffffff',
          },
          '& .MuiInputBase-input': {
            paddingRight: '0px', // Reduces padding on the right side of the input
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
          color: '#ffffff',
        },
      },
    },
  },
});

const CustomDatePicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <ThemeProvider theme={customDatePickerTheme}>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight='500'
        gutterBottom
        style={{ marginBottom: '3px', textAlign: 'left' }}
      >
        Deadline
      </Typography>
      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        renderInput={(params) => <TextField {...params} />}
      />
    </ThemeProvider>
  );
};

export default CustomDatePicker;
