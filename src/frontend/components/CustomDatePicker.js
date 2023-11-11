import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  TextField,
  createTheme,
  ThemeProvider,
  Typography,
} from "@mui/material";

const customDatePickerTheme = createTheme({
  palette: {
    primary: {
      main: "#50D890",
      contrastText: "#1B1B1B",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          input: {
            color: "#ffffff",
            height: "70px",
            padding: "10px 14px",
            fontSize: "1.25rem", // Adjust the font size as needed
          },
          "& .MuiInputLabel-root": {
            color: "#ffffff",
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1B1B1B",
            borderRadius: "10px",
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
            },
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
  },
});

const CustomDatePicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <ThemeProvider theme={customDatePickerTheme}>
      <Typography
        variant="subtitle1"
        color="white"
        fontWeight="600"
        gutterBottom
        style={{ marginBottom: "8px", textAlign: "left" }}
      >
        Automation Deadline
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
