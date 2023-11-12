import React from "react";
import { styled } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Custom styles for the input container
const CustomInputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  width: "160px",
  height: "90px",
});

// Custom styles for the input component
const CustomInput = styled(InputBase)({
  color: "white",
  fontSize: "1rem", // Adjust the font size if necessary
  "& .MuiInputBase-input": {
    textAlign: "center",
    padding: "0 10px", // Padding for spacing
    width: "calc(100% - 40px)", // Adjust width to make room for select
    height: "100%",
  },
});

// Custom styles for the select component
const CustomSelect = styled(Select)({
  color: "white",
  "& .MuiSelect-select": {
    paddingRight: "8px", // Reduced padding
    paddingLeft: "8px", // Reduced padding
    minWidth: "40px", // Set a minimum width for the selector
    height: "100%", // Match the height of the input
    fontSize: "1rem", // Keep the font size consistent with the input
  },
  "& .MuiSelect-icon": {
    color: "white", // White color for the dropdown icon
    top: "50%",
    transform: "translateY(-50%)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none", // Remove the outline
  },
  margin: "0", // Remove margins
  borderRadius: "0 10px 10px 0", // Only round the right corners
});

export default function CustomInputPercent({
  title,
  placeHolder,
  value,
  onValueChange,
  onSelectorChange, // New prop for handling changes in the selector
  selectorValue, // New prop for the value of the selector
}) {
  return (
    <div>
      <Typography
        variant="subtitle1"
        color="white"
        fontWeight="600"
        gutterBottom
        style={{ marginBottom: "8px", textAlign: "left" }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        <CustomSelect
          value={selectorValue}
          onChange={onSelectorChange}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon} // Make sure to import this
        >
          <MenuItem value="+">+</MenuItem>
          <MenuItem value="-">-</MenuItem>
        </CustomSelect>
        <CustomInput
          placeholder={placeHolder}
          value={value}
          onChange={onValueChange}
        />
      </CustomInputContainer>
    </div>
  );
}
