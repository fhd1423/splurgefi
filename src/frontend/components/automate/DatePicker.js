import {
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { DatePicker as DatePicker_mui } from '@mui/x-date-pickers/DatePicker';

const DatePicker = ({ selectedDate, setSelectedDate, limitOrder, title }) => {
  const customDatePickerTheme = createTheme({
    palette: {
      primary: {
        main: '#03C988',
        contrastText: '#ffffff',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            input: {
              color: '#ffffff',
              height: '35px',
              width: '100%',
              maxWidth: '170px',
              padding: '10px 14px',
              fontSize: '1rem',
            },
            '& .MuiInputLabel-root': {
              color: '#ffffff',
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
              paddingRight: '0px',
              paddingLeft: '10px',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1B1B1B',
              borderRadius: '10px',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent', // Remove outline
              },
              '&:hover fieldset': {
                borderColor: 'transparent', // Remove hover effect
              },
            },
          },
        },
      },

      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1B1B1B',
            color: '#ffffff',
          },
        },
      },
      MuiPickersDay: {
        // Days inside the calendar
        styleOverrides: {
          root: {
            today: {
              borderColor: '#ffffff',
            },
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-selected': {
              backgroundColor: '#03C988',
              color: '#1B1B1B',
              '&:hover': {
                backgroundColor: '#039874',
              },
            },
            '&.Mui-today': {
              borderColor: '#ffffff',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1B1B1B', // Background of the popup
            color: '#ffffff',
            '.MuiToolbar-root': {
              color: '#ffffff',
            },
            '.MuiButtonBase-root': {
              // Arrow buttons
              color: '#ffffff',
            },
            '.MuiPickersYear-root': {
              color: '#ffffff',
            },
            '.MuiPickersYear-yearSelected': {
              // Selected year
              color: '#03C988',
            },
            '.MuiPickersClockNumber-clockNumber': {
              color: '#ffffff',
            },
            '.MuiTypography-root': {
              // Month and year in the header
              color: '#ffffff',
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            marginLeft: '0px',
            marginRight: '0px',
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
        fontWeight='600'
        gutterBottom
        style={{ marginBottom: '3px', textAlign: 'left', fontSize: '.85rem' }}
      >
        {title}
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
