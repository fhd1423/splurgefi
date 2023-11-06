import { styled } from "@mui/system";
import React, { useState } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";

import {
  Typography,
  Select,
  MenuItem,
  InputBase,
  FormControl,
} from "@mui/material";

// Custom styles for the input container
const CustomInputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  padding: "0 10px", // Add padding here
  width: "400px",
  height: "90px",
  justifyContent: "space-between",
});

// Custom styles for the input component
const CustomInput = styled(InputBase)(({ theme }) => ({
  color: "white",
  fontSize: "2rem",
  "& .MuiInputBase-input": {
    padding: "20px 12px", // Adjust padding to vertically center the text
    flex: 1,
  },
}));

// Custom styles for the select component
const CustomSelect = styled(Select)(({ theme }) => ({
  color: "white",
  backgroundColor: "#27ae60",
  borderRadius: "20px",
  height: "30px", // Adjust height as needed to fit within CustomInputContainer
  width: "140px",
  "& .MuiSelect-select": {
    '&[aria-label="placeholder"]': {
      color: "white",
    },
    paddingRight: "30px",
    paddingLeft: "12px",
    display: "flex",
  },
  "& .MuiSelect-icon": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));
// Custom styles for the form control (to remove the underline from the select)
const CustomFormControl = styled(FormControl)({
  // Removed minWidth and added flexShrink
  flexShrink: 0,
  "&&&:before": {
    borderBottom: "none",
  },
  "&&:after": {
    borderBottom: "none",
  },
  "&& .MuiInput-underline:before": {
    borderBottom: "none",
  },
  "&& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "none",
  },
  marginRight: "10px", // Right margin to keep space inside the container
});

// Custom styles for the menu item in the dropdown
const CustomMenuItem = styled(MenuItem)({
  "&.MuiMenuItem-root": {
    justifyContent: "flex-end",
  },
});

export default function CustomInputToken({ title, options }) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    // Set the selectedValue to the value of the selected option
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <Typography
        variant="h6"
        color="white"
        fontWeight="600"
        gutterBottom
        style={{ marginBottom: "8px", fontSize: "1rem" }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        <CustomInput placeholder="0" />
        <CustomFormControl variant="standard">
          <CustomSelect
            value={selectedValue}
            onChange={handleChange}
            displayEmpty
            input={<OutlinedInput />}
            renderValue={(value) => {
              if (value === "") {
                return <span aria-label="placeholder">Select token</span>;
              }
              return (
                options.find((option) => option.value === value)?.label || ""
              );
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "right",
              },
              getContentAnchorEl: null,
            }}
          >
            {options.map((option) => (
              <CustomMenuItem key={option.value} value={option.value}>
                {option.label}
              </CustomMenuItem>
            ))}
          </CustomSelect>
        </CustomFormControl>
      </CustomInputContainer>
    </div>
  );
}
