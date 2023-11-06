import * as React from "react";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/system";
import Typography from "@mui/material/Typography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// // Custom styles for the input container if needed
// const CustomDatePickerContainer = styled("div")({
//   // Add any specific styles for the date picker container here if necessary
// });

// // You can use a similar approach to CustomInput for styling the TextField component
// const CustomStyledTextField = styled(TextField)({
//   "& label": {
//     color: "white", // Label color
//   },
//   "& label.Mui-focused": {
//     color: "white", // Label color when the input is focused
//   },
//   "& .MuiInputBase-input": {
//     color: "white", // Input text color
//   },
//   "& .MuiOutlinedInput-root": {
//     "& fieldset": {
//       borderColor: "white", // Border color
//     },
//     "&:hover fieldset": {
//       borderColor: "white", // Border color on hover
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: "white", // Border color when focused
//     },
//   },
//   "& .MuiSvgIcon-root": {
//     // This targets the icons inside the TextField component
//     color: "white", // Icons color like the calendar icon
//   },
// });

// export default function CustomDatePicker({ value, onChange, label, ...other }) {
//   return (
//     <CustomDatePickerContainer>
//       <Typography
//         variant="subtitle1"
//         color="white"
//         fontWeight="600"
//         gutterBottom
//       >
//         {label}
//       </Typography>
//       <DatePicker
//         value={value}
//         onChange={onChange}
//         renderInput={(params) => <CustomStyledTextField {...params} />}
//         {...other}
//       />
//     </CustomDatePickerContainer>
//   );
// }

const CustomStyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "white", // Label color when the input is focused
  },
  "& .MuiInputBase-input": {
    color: "white", // Input text color
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white", // Border color
    },
    "&:hover fieldset": {
      borderColor: "white", // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "white", // Border color when focused
    },
  },
  "& .MuiSvgIcon-root": {
    // This targets the icons inside the TextField component
    color: "white", // Icons color like the calendar icon
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
            }} // Ensure the label is white
            inputProps={{ ...params.inputProps, style: { color: "white" } }} // Ensure the input text is white
            // Add additional styles for white outline
            sx={{
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // Default outline color
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white", // Outline color on hover
                },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white", // Outline color when focused
                },
            }}
          />
        )}
        {...other}
      />
    </LocalizationProvider>
  );
}
