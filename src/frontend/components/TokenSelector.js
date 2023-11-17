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
  padding: "0 10px",
  width: "400px",
  height: "90px",
  justifyContent: "space-between",
});

// Custom styles for the input component
const CustomInput = styled(InputBase)(({ theme }) => ({
  color: "white",
  fontSize: "2rem",
  "& .MuiInputBase-input": {
    padding: "20px 12px",
    flex: 1,
  },
}));

// Custom styles for the select component
const CustomSelect = styled(Select)(({ theme }) => ({
  color: "white",
  backgroundColor: "#27ae60",
  borderRadius: "20px",
  height: "30px",
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

export default function TokenSelector({
  title,
  options,
  onValueChange,
  onSelectChange,
}) {
  // Local state for the input's value
  const [value, setValue] = useState("");

  // Local state for the selected token's value
  const [selectedValue, setSelectedValue] = useState("");

  // Update local state and lift up the value when it changes
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    onValueChange(newValue); // Send to parent view 
  };

  // Lift up the selected token when it changes
  const handleSelectChange = (event) => {
    const newToken = event.target.value;
    setSelectedValue(newToken);
    onSelectChange(newToken); // Send to parent view 
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
        <CustomInput
          placeholder="Token"
          value={selectedValue}
        />
        <CustomFormControl variant="standard">
          <CustomSelect
            value={selectedValue}
            onChange={handleSelectChange}
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
