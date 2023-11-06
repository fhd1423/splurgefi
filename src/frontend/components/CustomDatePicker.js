import * as React from "react";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/system";
import Typography from "@mui/material/Typography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const CustomStyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "white",
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiSvgIcon-root": {
    color: "white",
  },
});

export default function CustomDatePicker({ value, onChange, label, ...other }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        renderInput={(params) => (
          <CustomStyledTextField
            {...params}
            InputLabelProps={{
              ...params.InputLabelProps,
              style: { color: "white" },
            }}
            inputProps={{ ...params.inputProps, style: { color: "white" } }} // Ensure the input text is white
            sx={{
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white",
                },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white",
                },
            }}
          />
        )}
        {...other}
      />
    </LocalizationProvider>
  );
}
